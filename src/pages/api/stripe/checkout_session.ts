import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { TCartProduct } from "../../../redux/slices/cartSlice";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
    apiVersion: "2022-11-15",
    typescript: true,
});

export function formatAmountForStripe(amount: number, currency: string): number {
    let numberFormat = new Intl.NumberFormat(["en-US"], {
        style: "currency",
        currency: currency,
        currencyDisplay: "symbol",
    });
    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency: boolean = true;
    for (let part of parts) {
        if (part.type === "decimal") {
            zeroDecimalCurrency = false;
        }
    }
    return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { cartItems, address }: { cartItems: TCartProduct[]; address: string } = req.body;

        const params: Stripe.Checkout.SessionCreateParams = {
            submit_type: "pay",
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                ...cartItems.map((item) => ({
                    price_data: {
                        currency: "eur",
                        unit_amount: formatAmountForStripe(+item.price, "eur"),
                        product_data: {
                            name: item.name,
                            images: [item.variant_image],
                            description: `Size: ${item.size}, Color: ${item.color_name}`,
                        },
                    },
                    quantity: item.quantity,
                })),
            ],
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
