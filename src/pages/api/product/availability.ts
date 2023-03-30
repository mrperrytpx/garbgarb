// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { printfulApiInstance } from "../../../utils/axiosClients";

// ______________________________________________________________________________________

export type TWarehouse = {
    code: number;
    result: {
        product: TBaseProduct;
        variants: Array<TBaseVariants>;
    };
    extra: Array<unknown>;
};

export type TWarehouseSingleVariant = {
    code: number;
    result: {
        product: TBaseProduct;
        variant: TBaseVariants;
    };
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

export type TBaseVariants = {
    id: number;
    product_id: number;
    name: string;
    size: string;
    color: string;
    color_code: string;
    color_code2: string | null;
    image: string;
    price: string;
    in_stock: boolean;
    availability_regions: {
        [key: string]: string;
    };
    availability_status: Array<{
        [key: string]: string;
        status: string;
    }>;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const { data: sizes } = await printfulApiInstance.get<TWarehouse>(`/products/${id}`);

    res.status(200).json(sizes);
}

export default handler;
