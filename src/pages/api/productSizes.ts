// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// ______________________________________________________________________________________

export type TSizes = {
    code: number;
    result: TProductSizes;
    extra: Array<null>;
};

export type TMeasurement = {
    type_label: string;
    values: Array<{ size: string; value: string; min_value: string; max_value: string }>;
};

type TMeasurements = {
    type: "measure_yourself" | "product_measure" | string;
    unit: "inches" | "centimeters" | string;
    description: string;
    image_url: string;
    image_description: string;
    measurements: Array<TMeasurement>;
};

type TProductSizes = {
    product_id: number;
    available_sizes: Array<string>;
    size_tables: Array<TMeasurements>;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const { data: sizes } = await axios.get<TProductSizes>(
        `https://api.printful.com/products/${id}/sizes`
    );

    res.status(200).json(sizes);
}

export default handler;
