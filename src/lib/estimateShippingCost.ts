import { ApiError } from "next/dist/server/api-utils";
import { printfulApiKeyInstance } from "../utils/axiosClients";
import { ValidatedAddress } from "../pages/checkout";

export type TShippingOption = {
    id: string;
    name: string;
    rate: string;
    currency: "EUR";
    minDeliveryDays: number;
    maxDeliveryDays: number;
    minDeliveryDate: string;
    maxDeliveryDate: string;
};

export type TAllCosts = {
    costs: Costs;
    retail_costs: RetailCosts;
};

export type Costs = {
    currency: string;
    subtotal: number;
    discount: number;
    shipping: number;
    digitization: number;
    additional_fee: number;
    fulfillment_fee: number;
    retail_delivery_fee: number;
    tax: number;
    vat: number;
    total: number;
};

export type RetailCosts = {
    currency: string;
    subtotal: number;
    discount: number;
    shipping: number;
    tax: null;
    vat: null;
    total: number;
};

export const estimateShippingCost = async (
    address: ValidatedAddress,
    items: { quantity: number; sync_variant_id: number; retail_price: string }[]
): Promise<TAllCosts> => {
    console.log("addy", address);

    const shippingCostsResponse = await printfulApiKeyInstance.post("/orders/estimate-costs", {
        recipient: {
            address1: `${address.streetNumber} ${address.streetName}`,
            address2: address.subpremise,
            city: address.city,
            zip: address.zip,
            country_code: address.country,
        },
        items: items.map((item) => ({
            quantity: item.quantity,
            sync_variant_id: item.sync_variant_id,
            retail_price: item.retail_price,
        })),
        locale: "en-US",
    });

    if (shippingCostsResponse.status >= 400)
        throw new ApiError(
            shippingCostsResponse.status,
            "Cannot estimate shipping costs. Submit a valid address and valid items"
        );

    const estimatedCosts: TAllCosts = shippingCostsResponse.data.result;

    if (!estimatedCosts)
        throw new ApiError(500, "Something went wrong with extracting the estimated costs");

    return estimatedCosts;
};
