import type { NextApiRequest, NextApiResponse } from "next";
import { TOrder, TOrderResponse } from "../stripe/webhooks";
import { printfulApiKeyInstance } from "../../../utils/axiosClients";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";

async function getOrder(orderId: string | string[] | undefined): Promise<TOrderResponse> {
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

        const [orderError, orderData] = await tryCatchAsync(getOrder)(orderId);

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
