// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import type { TProduct } from "../store";

export type TProductDetails = {
    code: number;
    result: {
        sync_product: TProduct;
        sync_variants: Array<TProductVariant>;
    };
    extra?: Array<unknown>;
};

type BaseProduct = {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
};

type File = {
    id: number;
    type: "default" | "preview";
    hash: string | null;
    url: string | null;
    filename: string;
    mime_type: "image/png";
    size: number;
    width: number;
    height: number;
    dpi: number | null;
    status: string;
    created: number;
    thumbnail_url: string;
    preview_url: string;
    visible: boolean;
    is_temporary: boolean;
};

export type TProductVariant = {
    id: number;
    external_id: string;
    sync_product_id: number;
    name: string;
    synced: boolean;
    variant_id: number;
    main_category_id: number;
    warehouse_product_variant_id: number | null;
    retail_price: string;
    sku: string;
    currency: "Eur";
    product: BaseProduct;
    files: Array<File>;
    options: Array<{ id: string; value: string | boolean | Array<unknown> }>;
    is_ignored: boolean;
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

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const { data: product } = await printfulStore.get<TProductDetails>(`/products/${id}`);

    res.status(200).json(product);
}

export default handler;
