import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../../prisma/prisma";

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

        const canceledOrder = await prisma.order.findFirst({
            where: { id: +orderId },
        });

        if (!canceledOrder) return res.status(404).end();

        await prisma.order.delete({
            where: {
                id: canceledOrder.id,
            },
        });

        res.status(204).end();
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
