import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { z } from "zod";
import { estimateShippingCost, TShippingOption } from "../../../lib/estimateShippingCost";
import { shippingRates } from "../../../lib/shippingRates";
import { validateAddress } from "../../../lib/validateAddress";
import { printfulApiInstance, printfulApiKeyInstance } from "../../../utils/axiosClients";
import { tryCatchAsync, tryCatchSync } from "../../../utils/tryCatchWrappers";
import type { TAddress } from "../../checkout";
import type { TBaseVariants, TWarehouseSingleVariant } from "../product/availability";
import type { TProductDetails, TProductVariant } from "../product/index";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
    apiVersion: "2022-11-15",
});

const cartItemsSchema = z.array(
    z.object({
        store_product_id: z.number(),
        store_product_variant_id: z.number(),
        quantity: z.number({ description: "Quantity can't be 0" }).min(1),
    })
);
export type TCheckoutPayload = z.infer<typeof cartItemsSchema>;

function formatAmountForStripe(amount: number, currency: string): number {
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

interface PromiseFulfilledResult<T> {
    status: "fulfilled";
    value: T;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { cartItems, address }: { cartItems: TCheckoutPayload; address: TAddress } = req.body;

        if (!cartItems) return res.status(400).end("Please add items to your cart");

        // ADDRESS VALIDATION
        const [validateAddressError, validatedAddress] = await tryCatchAsync(validateAddress)(
            address
        );

        if (validateAddressError || !validatedAddress)
            return res
                .status(+validateAddressError?.cause! || 400)
                .end(validateAddressError?.message);

        // CART ITEMS VALIDATION
        const [zodError, parsedCartItems] = tryCatchSync(cartItemsSchema.parse)(cartItems);

        if (zodError || !parsedCartItems) {
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

        if (!printfulStoreItems) return res.status(500).end("The store is empty");

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

        if (!cartItemsExistInStore)
            return res.status(404).end("Cart items don't exist in the store");

        const uniqueVariantIDsInCart = [
            ...new Set(cartItemsExistInStore.map((item) => item?.variant_id)),
        ];

        const warehouseStock = (
            await Promise.allSettled(
                uniqueVariantIDsInCart.map(async (item) => {
                    const res = await printfulApiInstance.get<TWarehouseSingleVariant>(
                        `products/variant/${item}`
                    );
                    const data = res.data.result.variant;
                    return data;
                })
            )
        )
            .filter((x) => x.status === "fulfilled")
            .map((x) => (x as PromiseFulfilledResult<TBaseVariants>).value);

        const cartItemsInStock = cartItemsExistInStore
            .map((item) => {
                const warehouseItem = warehouseStock.find((x) => x.id === item?.variant_id);
                return {
                    ...item,
                    in_stock: !!warehouseItem?.availability_status.filter(
                        (reg) => reg.region.includes("EU") && reg.status === "in_stock"
                    ),
                };
            })
            .filter((item) => item.in_stock);

        if (!cartItemsInStock)
            return res.status(400).end("None of the items in Your aren't in stock");

        // estimated shipping endpoint to get Printful VAT for valid address
        const estimateItems = cartItemsInStock.map((item) => ({
            quantity: item.quantity,
            sync_variant_id: item.id,
            retail_price: item.retail_price,
        }));

        const [estimateShippingCostError, estimatedCosts] = await tryCatchAsync(
            estimateShippingCost
        )(validatedAddress, estimateItems);

        if (estimateShippingCostError || !estimatedCosts) {
            return res.status(400).end(estimateShippingCostError?.message);
        }

        const calculatedVAT =
            Math.round(
                (estimatedCosts.costs.total /
                    (estimatedCosts.costs.subtotal + estimatedCosts.costs.shipping)) *
                    100
            ) / 100;

        // Shipping Options to get delivery estimates
        const shippinOptsItems = cartItemsInStock.map((item) => ({
            quantity: item.quantity,
            external_variant_id: item.external_id,
        }));

        const [shippingOptsError, shippingOptions] = await tryCatchAsync(shippingRates)(
            validatedAddress,
            shippinOptsItems
        );

        if (shippingOptsError || !shippingOptions) {
            return res.status(400).end(shippingOptsError?.message);
        }

        //// TAX
        const taxRate: Stripe.TaxRate = await stripe.taxRates.create({
            display_name: "VAT",
            inclusive: false,
            percentage: +calculatedVAT.toString().split(".")[1],
        });

        // STRIPE CHECKOUT SESSION
        const params: Stripe.Checkout.SessionCreateParams = {
            submit_type: "pay",
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                ...cartItemsInStock.map((item) => ({
                    price_data: {
                        currency: "eur",
                        unit_amount: formatAmountForStripe(+item?.retail_price, "eur"),
                        product_data: {
                            name: item.name,
                            images: [item?.files[1].thumbnail_url],
                            description: item.product.name,
                        },
                    },
                    quantity: item.quantity,
                    tax_rates: [taxRate.id],
                })),
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
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/success`,
            cancel_url: process.env.NEXT_PUBLIC_SERVER_URL,
        };

        const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create(
            params
        );

        res.json(checkoutSession);
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
