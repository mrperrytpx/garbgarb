import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../../lib/stripe";
import { buffer } from "micro";
import Stripe from "stripe";

export const config = {
    api: {
        bodyParser: false,
    },
};

async function webhookHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const buf = await buffer(req);
        const sig = req.headers["stripe-signature"];
        const scrt = process.env.STRIPE_WEBHOOK_KEY;

        let event!: Stripe.Event;

        try {
            if (!sig || !scrt) return res.status(400).end("No");
            event = stripe.webhooks.constructEvent(buf, sig, scrt);
        } catch (error) {
            let message = "Unknown Error";
            if (error instanceof Error) message = error.message;
            return res.status(400).end(`"Webhook error:" ${message}`);
        }

        switch (event.type) {
            case "payment_intent.succeeded":
                console.log("EVENT", event);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).json({ received: true });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default webhookHandler;
