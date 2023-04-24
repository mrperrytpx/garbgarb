/// <reference types="stripe-event-types" />
import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../../lib/stripe";
import { buffer } from "micro";
import Stripe from "stripe";
import { printfulApiKeyInstance } from "../../../utils/axiosClients";
import { Costs } from "../../../lib/estimateShippingCost";
import { RetailCosts } from "../../../lib/estimateShippingCost";
import { prisma } from "../../../../prisma/prisma";
import Cors from "micro-cors";

const cors = Cors({
    allowMethods: ["POST", "HEAD"],
});

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
            console.log(error);
            return res.status(400).end(`"Webhook error:" ${message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
                expand: ["line_items"],
            });

            if (!session?.line_items) {
                console.log("No line items");
                return res.status(500).end("How did you place an order without items???");
            }

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

            const orderRes = await printfulApiKeyInstance.post<TOrderResponse>("/orders", {
                recipient: {
                    email: session.customer_details?.email,
                    name: session.customer_details?.name,
                    address1: session.customer_details?.address?.line1,
                    city: session.customer_details?.address?.city,
                    country_code: session.customer_details?.address?.country,
                    zip: session.customer_details?.address?.postal_code,
                    phone: session.customer_details?.phone,
                },
                items: orderedItems.map((item) => ({
                    quantity: item.metadata.quantity,
                    sync_variant_id: item.metadata.printful_id,
                    retail_price: item.metadata.retail_costs,
                })),
                retail_costs: {
                    currency: "EUR",
                    shipping: session.shipping_cost?.amount_total! / 100,
                    discount: "0.00",
                    tax: session.total_details?.amount_tax! / 100,
                },
            });

            const orderId = +orderRes.data.result.id;

            await prisma.order.create({
                data: {
                    userId: session.metadata?.user,
                    id: orderId,
                    totalAmount: session.amount_total ?? 0,
                    payment: session.payment_intent as string,
                    invoice: session.invoice as string,
                    email: session.customer_details?.email as string,
                },
            });
        } else if (event.type === "charge.refunded") {
            const refund = event.data.object;

            const order = await prisma.order.findFirst({
                where: {
                    payment: refund.payment_intent as string,
                },
            });

            if (order) {
                await prisma.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        canceled: true,
                    },
                });
            }
            await printfulApiKeyInstance.delete<TOrderResponse>(`/orders/${order?.id}`);
        } else if (event.type === "invoice.sent") {
            console.log("invoice sent", event.data.object.id);
        } else {
            console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).json({ received: true });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default cors(webhookHandler as any);

export type TOrderResponse = {
    code: number;
    result: TOrder;
    extra: [];
};

export type TOrder = {
    id: number;
    external_id: string;
    store: number;
    status: string;
    shipping: string;
    shipping_service_name: string;
    created: number;
    updated: number;
    recipient: TOrderAddress;
    items: TOrderItem[];
    incomplete_items: {
        name: string;
        quantity: number;
        sync_variant_id: number;
        external_variant_id: string;
        external_line_item_id: string;
    }[];
    costs: Costs;
    retail_costs: RetailCosts;
    pricing_breakdown: number[];
    shipments: {
        item_id: number;
        quantity: number;
    }[];
    gift: {
        subject: string;
        message: string;
    };
    packing_slip: {
        email: string;
        phone: string;
        message: string;
        logo_url: string;
    };
};

type TOrderAddress = {
    name: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state_code: string;
    state_name: string;
    country_code: string;
    country_name: string;
    zip: string;
    phone: string;
    email: string;
};

export type Primitive = string | number | boolean;

export type TOrderItem = {
    id: number;
    external_id: string;
    variant_id: number;
    sync_variant_id: number;
    external_variant_id: string;
    warehouse_product_variant_id: number;
    quantity: number;
    price: string;
    retail_price: string;
    name: string;
    product: {
        variant_id: number;
        product_id: number;
        image: string;
        name: string;
    };
    files: File[];
    options: {
        id: string;
        value: Primitive | Record<string, Primitive> | ReadonlyArray<Primitive>;
    }[];
    sku: string;
};

export type File = {
    id: number;
    type: string;
    hash: string;
    url: string;
    filename: string;
    mime_type: string;
    size: number;
    width: number;
    height: number;
    dpi: number;
    status: "ok" | "waiting" | "failed";
    created: number;
    thumbnail_url: string;
    preview_url: string;
    visible: boolean;
    options: { tempt: string }[];
};
