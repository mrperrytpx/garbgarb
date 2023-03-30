// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import type { TProduct } from "../store";
import { printfulApiKeyInstance } from "../../../utils/axiosClients";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";

export type TProductDetails = {
    code: number;
    result: TProductDetailsResult;
    extra?: Array<unknown>;
};

export type TProductDetailsResult = {
    sync_product: TProduct;
    sync_variants: Array<TProductVariant>;
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

async function getStoreProductVariants(
    id: string | string[] | undefined
): Promise<TProductDetailsResult> {
    if (!id) throw new Error("Provide a valid store product ID");
    if (Array.isArray(id)) {
        if (id.length > 1) throw new Error("Please provide only a single store product ID");
    }

    const storeResponse = await printfulApiKeyInstance.get<TProductDetails>(
        `/store/products/${id}`
    );

    if (storeResponse.status >= 400)
        throw new Error("Something is wrong with Printful's store, try again later");

    const data = storeResponse.data.result;

    if (!data) throw new Error("Something is wrong with Printful's store, try again later");

    return data;
}

// products https://api.printful.com/store/products
// single product https://api.printful.com/store/products/<id>
async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const [variantError, variantData] = await tryCatchAsync(getStoreProductVariants)(id);

    if (variantError || !variantData) return res.status(500).end(variantError?.message);

    res.status(200).json(variantData);
}

export default handler;
