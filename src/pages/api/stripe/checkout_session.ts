import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { z } from "zod";
import { estimateShippingCost, TShippingOption } from "../../../lib/estimateShippingCost";
import { shippingRates } from "../../../lib/shippingRates";
import { tryCatchAsync, tryCatchSync } from "../../../utils/tryCatchWrappers";
import type { ValidatedAddress } from "../../checkout";
import { checkPayloadStock } from "../../../lib/checkPayload";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
    apiVersion: "2022-11-15",
});

const cartItemsSchema = z
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
        const { cartItems, address }: { cartItems: TCheckoutPayload; address: ValidatedAddress } =
            req.body;

        if (!cartItems) return res.status(400).end("Please add items to your cart");

        // CART ITEMS VALIDATION
        const [zodError, parsedCartItems] = tryCatchSync(cartItemsSchema.parse)(cartItems);

        console.log("2");

        if (zodError || !parsedCartItems) {
            if (zodError instanceof z.ZodError) {
                return res.status(400).end(zodError.message);
            } else {
                return res.status(400).end("Wrong Items shape");
            }
        }

        const [stockError, stockData] = await tryCatchAsync(checkPayloadStock)(cartItems);
        if (stockError || !stockData) {
            return res.status(stockError?.statusCode || 500).end(stockError?.message);
        }

        // estimated shipping endpoint to get Printful VAT for valid address
        const estimateItems = stockData.map((item) => ({
            quantity: item.quantity,
            sync_variant_id: item.id,
            retail_price: item.retail_price,
        }));

        console.log("estimateItems", estimateItems);

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
        const shippinOptsItems = stockData.map((item) => ({
            quantity: item.quantity,
            external_variant_id: item.external_id,
        }));

        const [shippingOptsError, shippingOptions] = await tryCatchAsync(shippingRates)(
            address,
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
            country: address.country,
        });

        // Stripe customer
        const customer = await stripe.customers.create({
            email: "",
            name: "",
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
                ...stockData.map(
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
