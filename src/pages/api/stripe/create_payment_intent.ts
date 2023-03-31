// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";
import { stripe } from "../../../lib/stripe";
import Stripe from "stripe";
import { TCheckoutPayload, formatAmountForStripe } from "./checkout_session";
import { TProductVariant } from "../product";
import { checkPayloadStock } from "../../../lib/checkPayload";

// ______________________________________________________________________________________

async function createPaymentIntent(
    items: (TProductVariant & { quantity: number; in_stock: boolean })[]
): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: formatAmountForStripe(
            items.reduce((acc, curr) => {
                return +acc + +curr.retail_price;
            }, 0),
            "eur"
        ),
        currency: "eur",
        payment_method_types: ["card"],
    });

    return paymentIntent;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { cartItems }: { cartItems: TCheckoutPayload } = req.body;

        const [stockError, stockData] = await tryCatchAsync(checkPayloadStock)(cartItems);
        if (stockError || !stockData) {
            return res.status(stockError?.statusCode || 500).end(stockError?.message);
        }

        const [paymentIntentError, paymentIntent] = await tryCatchAsync(createPaymentIntent)(
            stockData
        );
        if (paymentIntentError || !paymentIntent) {
            return res
                .status(paymentIntentError?.statusCode || 500)
                .end(paymentIntentError?.message);
        }

        console.log("payment intent made", paymentIntent);

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
