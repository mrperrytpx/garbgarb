import { ApiError } from "next/dist/server/api-utils";
import { printfulApiKeyInstance } from "../utils/axiosClients";
import { TShippingOption } from "./estimateShippingCost";
import { ValidatedAddress } from "../pages/checkout";

export type TShippingRatesItem = {
    quantity: number;
    external_variant_id: string;
};

export const shippingRates = async (
    address: ValidatedAddress,
    items: Array<TShippingRatesItem>
): Promise<TShippingOption[]> => {
    const shippingRatesResponse = await printfulApiKeyInstance.post("/shipping/rates", {
        recipient: {
            address1: `${address.streetNumber} ${address.streetName}`,
            address2: address.subpremise,
            city: address.city,
            country_code: address.country,
            zip: address.zip,
        },
        items,
        currency: "EUR",
        locale: "en-US",
    });

    if (shippingRatesResponse.status >= 400)
        throw new ApiError(shippingRatesResponse.status, "Something is wrong, try again later");

    const shippingOptionsData: TShippingOption[] = shippingRatesResponse.data.result;

    if (!shippingOptionsData) throw new ApiError(500, "Something is wrong");

    return shippingOptionsData;
};
