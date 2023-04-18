import { NextApiRequest, NextApiResponse } from "next";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";
import { stripe } from "../../../lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../prisma/prisma";
import Stripe from "stripe";

async function deleteOrder(paymentId: string): Promise<Stripe.Response<Stripe.Refund>> {
    const data = await stripe.refunds.create({
        payment_intent: paymentId,
        reason: "requested_by_customer",
    });

    return data;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "DELETE") {
        const { orderId } = req.query;

        if (!orderId) return res.status(404).end();

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end();

        const userOrder = (
            await prisma.user
                .findUnique({
                    where: {
                        id: session.user.id,
                    },
                })
                .orders({
                    where: {
                        id: +orderId,
                    },
                })
        )?.find((x) => x.id === +orderId);

        if (!userOrder) return res.status(403).end();

        const [cancelError, cancelData] = await tryCatchAsync(deleteOrder)(userOrder.payment);

        if (cancelError || !cancelData) {
            console.log(cancelError);
            return res.status(500).end(cancelError?.message);
        }

        await prisma.order.update({
            where: { id: +orderId },
            data: {
                canceled: true,
            },
        });

        res.status(204).end();
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
