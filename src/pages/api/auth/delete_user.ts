import type { NextApiRequest, NextApiResponse } from "next";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";
import { getServerSession } from "next-auth";
import { authOptions } from "./[...nextauth]";
import { prisma } from "../../../../prisma/prisma";

async function deleteUser(userId: string) {
    console.log("trying");

    await prisma.order.deleteMany({
        where: {
            userId,
        },
    });

    await prisma.user.delete({
        where: {
            id: userId,
        },
    });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "DELETE") {
        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end();

        const [deleteUserError] = await tryCatchAsync(deleteUser)(session.user?.id);

        if (deleteUserError) {
            console.log(deleteUserError);
            return res.status(500).end(deleteUserError?.message);
        }

        res.status(204).end();
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
