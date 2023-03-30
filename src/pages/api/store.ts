// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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

// products https://api.printful.com/store/products
// single product https://api.printful.com/store/products/<id>

async function getStoreProducts(): Promise<TProduct[]> {
    const storeResponse = await printfulApiKeyInstance.get<TPrintfulStore>("/store/products");

    if (storeResponse.status >= 400)
        throw new Error("Something is wrong with Printful's store, try again later");

    const data = storeResponse.data.result;

    if (!data) throw new Error("Something is wrong with Printful's store, try again later");

    return data;
}

async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const [storeError, storeData] = await tryCatchAsync(getStoreProducts)();

    if (storeError || !storeData) return res.status(500).end(storeError?.message);

    res.status(200).json(storeData);
}

export default handler;
