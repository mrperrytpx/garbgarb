import { TCartProduct } from "../redux/slices/cartSlice";
import { printfulApiKeyInstance } from "../utils/axiosClients";
import { TPostgridValidatedAddress } from "./validateAddress";

// export type TShippingOption = {
//     id: string;
//     name: string;
//     rate: string;
//     currency: "EUR";
//     minDeliveryDays: number;
//     maxDeliveryDays: number;
//     minDeliveryDate: string;
//     maxDeliveryDate: string;
// };

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
    address: TPostgridValidatedAddress,
    items: TCartProduct[]
): Promise<TAllCosts> => {
    const shippingCostsResponse = await printfulApiKeyInstance.post(
        "/orders/estimate-costs",
        {
            recipient: {
                address1: address.line1,
                address2: address.line2,
                city: address.city,
                zip: address.postalOrZip,
                country_code: address.country,
            },
            items: items.map((item) => ({
                quantity: item.quantity,
                sync_variant_id: item.store_product_variant_id,
                retail_price: item.price,
            })),
            locale: "en-US",
        },
        {
            headers: {
                "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID,
            },
        }
    );

    if (shippingCostsResponse.status >= 400)
        throw new Error("Cannot estimate shipping costs. Submit a valid address and valid items");

    const estimatedCosts: TAllCosts = shippingCostsResponse.data.result;

    if (!estimatedCosts)
        throw new Error("Something went wrong with extracting the estimated costs");

    return estimatedCosts;
};
