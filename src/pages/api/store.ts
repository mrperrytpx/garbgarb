// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// products https://api.printful.com/store/products?store_id=9524028
// single product https://api.printful.com/store/products/296406176?store_id=9524028

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
