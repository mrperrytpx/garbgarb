// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// ______________________________________________________________________________________

export type TProductAvailability = {
    code: number;
    result: TBaseProduct;
    extra: Array<unknown>;
};

type TBaseProductOptions = {
    id: string;
    title: string;
    type: string;
    values: {
        [key: string]: string;
    } | null;
    additional_price: string | null;
    additional_price_breakdown: Array<unknown>;
};

type TBaseProductTechniques = {
    key: string;
    display_name: string;
    is_default: boolean;
};

type TBaseProductFiles = {
    id: string;
    type: string;
    title: string;
    additional_price: string | null;
    options: Array<unknown>;
};

type TBaseProduct = {
    id: number;
    main_category_id: number;
    type: string;
    description: string;
    type_name: string;
    title: string;
    brand: string;
    model: string;
    image: string;
    variant_count: number;
    currency: string;
    options: Array<TBaseProductOptions>;
    dimensions: string | null;
    is_discontinued: boolean;
    avg_fullfillment_time: string | null;
    techniques: Array<TBaseProductTechniques>;
    files: Array<TBaseProductFiles>;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const { data: sizes } = await axios.get<TProductAvailability>(
        `https://api.printful.com/products/${id}`
    );

    res.status(200).json(sizes);
}

export default handler;
