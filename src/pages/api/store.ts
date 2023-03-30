// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { printfulApiKeyInstance } from "../../utils/axiosClients";

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
async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const { data: products } = await printfulApiKeyInstance.get<TPrintfulStore>("/store/products");

    res.status(200).json(products);
}

export default handler;
