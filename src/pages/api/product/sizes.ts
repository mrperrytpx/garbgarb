// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { printfulApiInstance } from "../../../utils/axiosClients";
import { tryCatch } from "../../../utils/tryCatchWrapper";

// ______________________________________________________________________________________

export type TSizes = {
    code: number;
    result: TProductSizes;
    extra: Array<unknown>;
};

export type TMeasurement = {
    type_label: string;
    values: Array<{ size: string; value?: string; min_value?: string; max_value?: string }>;
};

type TMeasurements = {
    type: "measure_yourself" | "product_measure" | string;
    unit: "inches" | "centimeters" | string;
    description: string;
    image_url: string;
    image_description: string;
    measurements: Array<TMeasurement>;
};

export type TProductSizes = {
    product_id: number;
    available_sizes: Array<string>;
    size_tables: Array<TMeasurements>;
};

// ______________________________________________________________________________________

async function getProductSizes(id: string | string[] | undefined): Promise<TProductSizes> {
    if (!id) throw new Error("Provide a valid store product ID");
    if (Array.isArray(id)) {
        if (id.length > 1) throw new Error("Please provide only a single store product ID");
    }

    const storeResponse = await printfulApiInstance.get<TSizes>(`/products/${id}/sizes`);

    if (storeResponse.status >= 400)
        throw new Error("Something is wrong with Printful's API, try again later");

    const data = storeResponse.data.result;

    if (!data) throw new Error("Something is wrong with Printful's API, try again later");

    return data;
}

// products https://api.printful.com/store/products
// single product https://api.printful.com/store/products/<id>
async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const [sizesError, sizesData] = await tryCatch(getProductSizes)(id);

    if (sizesError || !sizesData) return res.status(500).end(sizesError?.message);

    res.status(200).json(sizesData);
}

export default handler;
