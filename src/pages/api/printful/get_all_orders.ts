import type { NextApiRequest, NextApiResponse } from "next";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";

async function getAllOrders(userId: string) {
    const orders = await prisma.order.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return orders;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end();

        const [allOrdersError, allOrdersData] = await tryCatchAsync(getAllOrders)(session.user.id);

        if (allOrdersError || !allOrdersData) {
            console.log(allOrdersError?.statusCode);
            return res.status(500).end(allOrdersError?.message);
        }

        res.status(200).json(allOrdersData);
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
