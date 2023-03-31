/// <reference types="stripe-event-types" />
import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../../lib/stripe";
import { buffer } from "micro";
import Stripe from "stripe";
import { printfulApiKeyInstance } from "../../../utils/axiosClients";
import axios from "axios";

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

        let event;

        try {
            if (!sig || !scrt) return res.status(400).end("No");
            event = stripe.webhooks.constructEvent(buf, sig, scrt) as Stripe.DiscriminatedEvent;
        } catch (error) {
            let message = "Unknown Error";
            if (error instanceof Error) message = error.message;
            return res.status(400).end(`"Webhook error:" ${message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
                expand: ["line_items"],
            });

            // console.log(session);

            if (!session?.line_items)
                return res.status(500).end("How did you place an order without items???");

            const orderedItems = (
                await Promise.allSettled(
                    session?.line_items?.data.map(async (item) => {
                        const product = await stripe.products.retrieve(
                            item.price?.product as string
                        );
                        return product;
                    })
                )
            )
                .filter((x) => x.status === "fulfilled")
                .map((x) => (x as PromiseFulfilledResult<Stripe.Product>).value);

            // const recipient = {
            //     name: session.customer_details?.name,
            //     address1: session.customer_details?.address?.line1,
            //     city: session.customer_details?.address?.city,
            //     county_code: session.customer_details?.address?.country,
            //     zip: session.customer_details?.address?.postal_code,
            //     phone: session.customer_details?.phone,
            // };

            // const items = orderedItems.map((item) => ({
            //     quantity: item.metadata.quantity,
            //     sync_variant_id: item.metadata.printful_id,
            // }));

            // console.log(recipient, items);

            const placeOrder = await axios.post(
                "https://api.printful.com/orders",
                {
                    recipient: {
                        name: session.customer_details?.name,
                        address1: session.customer_details?.address?.line1,
                        city: session.customer_details?.address?.city,
                        county_code: session.customer_details?.address?.country,
                        zip: session.customer_details?.address?.postal_code,
                        phone: session.customer_details?.phone,
                    },
                    items: orderedItems.map((item) => ({
                        quantity: item.metadata.quantity,
                        sync_variant_id: item.metadata.printful_id,
                    })),
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
                        "Content-Type": "application/json",
                        "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID,
                    },
                }
            );

            console.log("ORDER ????", placeOrder.data);
        } else {
            console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).json({ received: true });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default webhookHandler;
