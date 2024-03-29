import type { NextApiRequest, NextApiResponse } from "next";
import { printfulApiInstance } from "../../../utils/axiosClients";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";
import { ApiError } from "next/dist/server/api-utils";

export type TWarehouse = {
    code: number;
    result: TWarehouseResult;
    extra: Array<unknown>;
};

export type TWarehouseResult = {
    product: TBaseProduct;
    variants: Array<TBaseVariants>;
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

// ______________________________________________________________________________________

async function getWarehouseAvailability(
    id: string | string[] | undefined
): Promise<TWarehouseResult> {
    if (!id) throw new Error("Provide a valid store product ID");
    if (Array.isArray(id)) {
        if (id.length > 1) throw new ApiError(400, "Please provide only a single store product ID");
    }

    const storeResponse = await printfulApiInstance.get<TWarehouse>(`/products/${id}`);

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

        const [availabilityError, availabilityData] = await tryCatchAsync(getWarehouseAvailability)(
            id
        );

        if (availabilityError || !availabilityData)
            return res.status(availabilityError?.statusCode || 500).end(availabilityError?.message);

        res.status(200).json(availabilityData);
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
