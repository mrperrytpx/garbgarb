// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { TCartProduct } from "../../../redux/slices/cartSlice";
import { TAddress } from "../../checkout";

const printfulStoreClient = axios.create({
    baseURL: "https://api.printful.com",
    headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
    timeout: 7000,
    signal: new AbortController().signal,
});

export type TShippingOption = {
    id: string;
    name: string;
    rate: string;
    currency: "EUR";
    minDeliveryDays: number;
    maxDeliveryDays: number;
    minDeliveryDate: string;
    maxDeliveryDate: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { cartItems, address }: { cartItems: TCartProduct[]; address: TAddress } = req.body;
        const shippingOptionsResponse = await printfulStoreClient.post(
            "/shipping/rates",
            {
                recipient: {
                    country_code: address.country_code,
                    address1: address.address1,
                    address2: address.address2,
                    zip: address.zip,
                    city: address.city,
                },
                items: cartItems.map((item) => ({
                    quantity: item.quantity,
                    external_variant_id: item.external_id,
                })),
                locale: "en-US",
            },
            {
                headers: {
                    "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID,
                },
            }
        );
        const shippingOptionsData: TShippingOption[] = shippingOptionsResponse.data.result;

        if (!shippingOptionsData) return res.status(400).end("No shipping available");

        res.json(shippingOptionsData);
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
