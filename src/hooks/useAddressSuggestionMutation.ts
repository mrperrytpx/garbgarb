import { useMutation } from "@tanstack/react-query";
import { AutocompletePrediction } from "react-places-autocomplete";
import { ClearSuggestions, getGeocode } from "use-places-autocomplete";
import { UseFormGetValues, UseFormSetValue } from "react-hook-form/dist/types";
import { TGoogleAddressDetails } from "../components/AddressForm";
import { useExtraCostsMutation } from "./useExtraCostsMutation";
import { Dispatch, SetStateAction } from "react";
import { TShippingRatesResp } from "../pages/api/printful/shipping_rates";
import { useSelector } from "react-redux";
import { cartSelector } from "../redux/slices/cartSlice";

interface IGetAddressSuggestion {
    suggestion: AutocompletePrediction;
}

type TSetValue = UseFormSetValue<{
    city: string;
    country: string;
    province: string;
    zip: string;
    streetName: string;
    streetNumber: string;
    subpremise?: string | undefined;
}>;

export type TGetValues = UseFormGetValues<{
    city: string;
    country: string;
    province: string;
    zip: string;
    streetName: string;
    streetNumber: string;
    subpremise?: string | undefined;
}>;

export const useAddressSuggestionMutation = (
    setExtraCosts: Dispatch<SetStateAction<TShippingRatesResp | null>>,
    setAddress: Dispatch<SetStateAction<TGoogleAddressDetails[]>>,
    setValue: TSetValue,
    getValues: TGetValues,
    clearSuggestions: ClearSuggestions
) => {
    const extraCostsMutation = useExtraCostsMutation(setExtraCosts, clearSuggestions);
    const productsInCart = useSelector(cartSelector);

    const getAddressSuggestion = async ({ suggestion }: IGetAddressSuggestion) =>
        await getGeocode({ placeId: suggestion.place_id });

    return useMutation(getAddressSuggestion, {
        onSuccess: (mutData) => {
            setAddress(mutData[0].address_components as TGoogleAddressDetails[]);

            setValue(
                "streetName",
                mutData[0].address_components.find((x: TGoogleAddressDetails) =>
                    x.types.includes("route")
                )?.long_name || ""
            );
            setValue(
                "streetNumber",
                mutData[0].address_components.find((x: TGoogleAddressDetails) =>
                    x.types.includes("street_number")
                )?.long_name || ""
            );
            setValue(
                "city",
                mutData[0].address_components.find((x: TGoogleAddressDetails) =>
                    x.types.includes("locality")
                )?.long_name || ""
            );
            setValue(
                "country",
                mutData[0].address_components.find((x: TGoogleAddressDetails) =>
                    x.types.includes("country")
                )?.short_name || ""
            );
            setValue(
                "province",
                mutData[0].address_components.find((x: TGoogleAddressDetails) =>
                    x.types.includes("administrative_area_level_1")
                )?.long_name || ""
            );
            setValue(
                "zip",
                mutData[0].address_components.find((x: TGoogleAddressDetails) =>
                    x.types.includes("postal_code")
                )?.long_name || ""
            );
            setValue(
                "subpremise",
                mutData[0].address_components.find((x: TGoogleAddressDetails) =>
                    x.types.includes("subpremise")
                )?.long_name || ""
            );

            extraCostsMutation.mutateAsync({ productsInCart, address: getValues() });
        },
    });
};
