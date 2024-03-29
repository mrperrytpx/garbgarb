import type { NextApiRequest, NextApiResponse } from "next";
import { printfulApiKeyInstance } from "../../utils/axiosClients";
import { tryCatchAsync } from "../../utils/tryCatchWrappers";

export type TProduct = {
    id: number;
    external_id: string;
    name: string;
    variants: number;
    synced: number;
    thumbnail_url: string;
    is_ignored: boolean;
};

type TPage = {
    total: number;
    offset: number;
    limit: number;
};

export type TPrintfulStore = {
    code: number;
    result: TProduct[];
    extra?: Array<unknown>;
    paging: TPage;
};

// ______________________________________________________________________________________

async function getStoreProducts(): Promise<TProduct[]> {
    const storeResponse = await printfulApiKeyInstance.get<TPrintfulStore>("/store/products");

    if (storeResponse.status >= 400)
        throw new Error("Something is wrong with Printful's store, try again later");

    const data = storeResponse.data.result;

    if (!data) throw new Error("Something is wrong with Printful's store, try again later");

    return data;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const [storeError, storeData] = await tryCatchAsync(getStoreProducts)();

        if (storeError || !storeData) {
            console.log(storeError);
            return res.status(500).end(storeError?.message);
        }

        res.status(200).json(storeData);
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
