import type { NextApiRequest, NextApiResponse } from "next";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../prisma/prisma";
import { stripe } from "../../../lib/stripe";
import Stripe from "stripe";

async function resendInvoice(invoiceId: string): Promise<Stripe.Response<Stripe.Invoice>> {
    const invoice = await stripe.invoices.sendInvoice(invoiceId);
    return invoice;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { orderId } = req.body;

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

        const [invoiceError, invoiceData] = await tryCatchAsync(resendInvoice)(userOrder?.invoice);

        if (invoiceError || !invoiceData) {
            console.log(invoiceError);
            return res.status(500).end(invoiceError?.message);
        }

        res.status(200).end();
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
