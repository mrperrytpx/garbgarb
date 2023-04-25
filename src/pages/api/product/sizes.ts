import type { NextApiRequest, NextApiResponse } from "next";
import { printfulApiInstance } from "../../../utils/axiosClients";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";
import { ApiError } from "next/dist/server/api-utils";

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
        if (id.length > 1) throw new ApiError(404, "Please provide only a single store product ID");
    }

    const storeResponse = await printfulApiInstance.get<TSizes>(`/products/${id}/sizes`);

    if (storeResponse.status >= 400)
        throw new ApiError(
            storeResponse.status,
            "Something is wrong with Printful's API, try again later"
        );

    const data = storeResponse.data.result;

    if (!data) throw new ApiError(500, "Something is wrong with Printful's API, try again later");

    return data;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { id } = req.query;

        const [sizesError, sizesData] = await tryCatchAsync(getProductSizes)(id);

        if (sizesError || !sizesData)
            return res.status(sizesError?.statusCode || 500).end(sizesError?.message);

        res.status(200).json(sizesData);
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
