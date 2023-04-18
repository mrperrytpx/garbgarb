import type { NextApiRequest, NextApiResponse } from "next";
import { TOrderResponse } from "../stripe/webhooks";
import { printfulApiKeyInstance } from "../../../utils/axiosClients";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../prisma/prisma";

async function getOrder(orderId: number): Promise<TOrderResponse> {
    const storeResponse = await printfulApiKeyInstance.get<TOrderResponse>(`/orders/${orderId}`);

    if (storeResponse.status >= 400)
        throw new Error("Something is wrong with Printful's store, try again later");

    const data = storeResponse.data;

    if (!data) throw new Error("Something is wrong with Printful's store, try again later");

    return data;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
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

        if (!userOrder) return res.status(404).end();

        const [orderError, orderData] = await tryCatchAsync(getOrder)(userOrder?.id);

        if (orderError || !orderData) {
            console.log(orderError);
            return res.status(500).end(orderError?.message);
        }

        res.status(200).json(orderData);
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
