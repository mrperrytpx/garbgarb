import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { z } from "zod";
import { estimateShippingCost, TShippingOption } from "../../../lib/estimateShippingCost";
import { shippingRates } from "../../../lib/shippingRates";
import { tryCatchAsync, tryCatchSync } from "../../../utils/tryCatchWrappers";
import { ValidatedAddress } from "../../checkout";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { printfulApiKeyInstance } from "../../../utils/axiosClients";
import { TProductDetails, TProductVariant } from "../product";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
    apiVersion: "2022-11-15",
});

export const cartItemsSchema = z
    .array(
        z.object({
            store_product_id: z.number(),
            store_product_variant_id: z.number(),
            quantity: z.number({ description: "Quantity can't be 0" }).min(1),
        })
    )
    .min(1);
export type TCheckoutPayload = z.infer<typeof cartItemsSchema>;

export function formatAmountForStripe(amount: number, currency: string): number {
    let numberFormat = new Intl.NumberFormat(["en-US"], {
        style: "currency",
        currency: currency,
        currencyDisplay: "symbol",
    });
    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency = true;
    for (let part of parts) {
        if (part.type === "decimal") {
            zeroDecimalCurrency = false;
        }
    }
    return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const {
            cartItems,
            address,
            email,
        }: { cartItems: TCheckoutPayload; address: ValidatedAddress; email: string } = req.body;

        if (!cartItems) {
            console.log("No items in cart");
            return res.status(400).end("Please add items to your cart");
        }

        // CART ITEMS VALIDATION
        const [zodError, parsedCartItems] = tryCatchSync(cartItemsSchema.parse)(cartItems);

        if (zodError || !parsedCartItems) {
            console.log(zodError);
            if (zodError instanceof z.ZodError) {
                return res.status(400).end(zodError.message);
            } else {
                return res.status(400).end("Wrong Items shape");
            }
        }

        // ID VALIDATIONS SO ITEMS EXIST
        const uniqueProductIDsInCart = [
            ...new Set(parsedCartItems.map((item) => item.store_product_id)),
        ];

        const printfulStoreItems = (
            await Promise.allSettled(
                uniqueProductIDsInCart.map(async (id) => {
                    const res = await printfulApiKeyInstance.get<TProductDetails>(
                        `store/products/${id}`
                    );
                    const data = res.data.result.sync_variants;
                    return data;
                })
            )
        )
            .filter((x) => x.status === "fulfilled")
            .map((x) => (x as PromiseFulfilledResult<TProductVariant[]>).value)
            .flat();

        if (!printfulStoreItems) return res.status(500).end("The store is empty. Try again later");

        //-------------------//
        const cartItemsExistInStore = parsedCartItems
            .map((item) => {
                const storeItem = printfulStoreItems.filter(
                    (x) => x.id === item.store_product_variant_id
                )[0];
                if (!storeItem) return null;
                return { ...storeItem, quantity: item.quantity };
            })
            .filter(Boolean) as (TProductVariant & { quantity: number })[];

        if (!cartItemsExistInStore) {
            return res.status(404).end("Items in your cart don't exist in the Store");
        }

        // estimated shipping endpoint to get Printful VAT for valid address
        const estimateItems = cartItemsExistInStore.map((item) => ({
            quantity: item.quantity,
            sync_variant_id: item.id,
            retail_price: item.retail_price,
        }));

        const [estimateShippingCostError, estimatedCosts] = await tryCatchAsync(
            estimateShippingCost
        )(address, estimateItems);

        if (estimateShippingCostError || !estimatedCosts) {
            return res
                .status(estimateShippingCostError?.statusCode || 500)
                .end(estimateShippingCostError?.message);
        }

        const calculatedVAT =
            Math.round(
                (estimatedCosts.costs.total /
                    (estimatedCosts.costs.subtotal + estimatedCosts.costs.shipping)) *
                    100
            ) / 100;

        // Shipping Options to get delivery estimates
        const shippinOptsItems = cartItemsExistInStore.map((item) => ({
            quantity: item.quantity,
            external_variant_id: item.external_id,
        }));

        const [shippingOptsError, shippingOptions] = await tryCatchAsync(shippingRates)(
            address,
            shippinOptsItems
        );

        if (shippingOptsError || !shippingOptions) {
            console.log(shippingOptsError);
            return res.status(400).end(shippingOptsError?.message);
        }

        //// TAX
        const taxRate: Stripe.TaxRate = await stripe.taxRates.create({
            display_name: "VAT",
            inclusive: false,
            percentage: +calculatedVAT.toString().split(".")[1],
            country: address.country,
        });

        // auth sess
        const session = await getServerSession(req, res, authOptions);

        // Stripe customer
        const customer = await stripe.customers.create({
            email: email,
            address: {
                line1: `${address.streetNumber} ${address.streetName}`,
                line2: address.subpremise,
                city: address.city,
                postal_code: address.zip,
                country: address.country,
            },
        });

        // STRIPE CHECKOUT SESSION
        const params: Stripe.Checkout.SessionCreateParams = {
            customer: customer.id,
            submit_type: "pay",
            mode: "payment",
            phone_number_collection: {
                enabled: true,
            },
            billing_address_collection: "auto",
            payment_method_types: ["card"],
            line_items: [
                ...cartItemsExistInStore.map(
                    (item): Stripe.Checkout.SessionCreateParams.LineItem => ({
                        price_data: {
                            currency: "eur",
                            unit_amount: formatAmountForStripe(+item?.retail_price, "eur"),
                            product_data: {
                                name: item.name,
                                images: [item?.files[1].thumbnail_url],
                                description: item.product.name,
                                metadata: {
                                    printful_id: item.id,
                                    quantity: item.quantity,
                                    retail_costs: item.retail_price,
                                },
                            },
                        },
                        quantity: item.quantity,
                        tax_rates: [taxRate.id],
                    })
                ),
            ],
            shipping_options: shippingOptions.map(
                (
                    shipping: TShippingOption
                ): Stripe.Checkout.SessionCreateParams.ShippingOption => ({
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: {
                            amount: formatAmountForStripe(
                                +shipping.rate * calculatedVAT,
                                shipping.currency
                            ),
                            currency: shipping.currency.toLowerCase(),
                        },
                        display_name: shipping.id,
                        delivery_estimate: {
                            minimum: {
                                unit: "business_day",
                                value: shipping.minDeliveryDays,
                            },
                            maximum: {
                                unit: "business_day",
                                value: shipping.maxDeliveryDays,
                            },
                        },
                    },
                })
            ) as Stripe.Checkout.SessionCreateParams.ShippingOption[],
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: process.env.NEXT_PUBLIC_SERVER_URL,
            invoice_creation: {
                enabled: true,
            },
            metadata: {
                user: session?.user?.id ? session.user.id : "",
            },
        };

        stripe.checkout.sessions.create(params);

        res.status(200).end();
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
