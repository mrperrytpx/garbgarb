import { useQuery } from "@tanstack/react-query";
import { AutocompletePrediction } from "react-places-autocomplete";
import { getGeocode } from "use-places-autocomplete";
import { TGoogleAddressDetails } from "../components/AddressForm";
import { UseFormSetValue } from "react-hook-form";
import { ValidatedAddress, ValidatedForm } from "../pages/checkout";

export type TSuggestion = ReturnType<typeof getAddressSuggestion>;

const getAddressSuggestion = async (suggestion: AutocompletePrediction | null) => {
    const response = await getGeocode({ placeId: suggestion?.place_id });
    const data = response[0].address_components;

    const address: ValidatedAddress = {
        streetName:
            data.find((x: TGoogleAddressDetails) => x.types.includes("route"))?.long_name || "",
        streetNumber:
            data.find((x: TGoogleAddressDetails) => x.types.includes("street_number"))?.long_name ||
            "",
        city:
            data.find((x: TGoogleAddressDetails) => x.types.includes("locality"))?.long_name || "",
        country:
            data.find((x: TGoogleAddressDetails) => x.types.includes("country"))?.short_name || "",
        province:
            data.find((x: TGoogleAddressDetails) => x.types.includes("administrative_area_level_1"))
                ?.long_name || "",
        zip:
            data.find((x: TGoogleAddressDetails) => x.types.includes("postal_code"))?.long_name ||
            "",
        subpremise: data.find((x: TGoogleAddressDetails) => x.types.includes("subpremise"))
            ?.long_name,
    };
    return address;
};

export const useGetSuggestionsQuery = (
    suggestion: AutocompletePrediction | null,
    setValue?: UseFormSetValue<ValidatedForm>
) => {
    return useQuery({
        queryKey: ["address", suggestion?.description],
        queryFn: () => getAddressSuggestion(suggestion),
        enabled: !!suggestion,
        onSuccess: (data) => {
            if (setValue) {
                setValue("streetName", data.streetName || "");
                setValue("streetNumber", data.streetNumber || "");
                setValue("city", data.city || "");
                setValue("country", data.country || "");
                setValue("province", data.province || "");
                setValue("zip", data.zip || "");
                setValue("subpremise", data?.subpremise);
            }
        },
    });
};
