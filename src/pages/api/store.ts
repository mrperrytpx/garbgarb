// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

type TShortProduct = {
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
    result: TShortProduct[];
    extra?: Array<null>;
    paging: TPage;
};

// ______________________________________________________________________________________

// products https://api.printful.com/store/products
// single product https://api.printful.com/store/products/<id>

const printfulStore = axios.create({
    baseURL: "https://api.printful.com/store",
    headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
    timeout: 7000,
    signal: new AbortController().signal,
});

async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const { data: products } = await printfulStore.get("/products");

    res.status(200).json(products);
}

export default handler;
