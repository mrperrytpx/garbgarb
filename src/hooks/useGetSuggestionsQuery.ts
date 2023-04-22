import { useQuery } from "@tanstack/react-query";
import { AutocompletePrediction } from "react-places-autocomplete";
import { getGeocode } from "use-places-autocomplete";
import { TGoogleAddressDetails } from "../components/CustomerForm";
import { ValidatedAddress } from "../pages/checkout";
import { allowedCountries } from "../utils/allowedCountries";

export type TSuggestion = ReturnType<typeof getAddressSuggestion>;

type TAllowed = typeof allowedCountries;

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
            data.find(
                (x: TGoogleAddressDetails) =>
                    x.types.includes("locality") || x.types.includes("postal_town")
            )?.long_name || "",
        country:
            (data.find((x: TGoogleAddressDetails) => x.types.includes("country"))
                ?.short_name as TAllowed[number]) || "",
        zip:
            data.find((x: TGoogleAddressDetails) => x.types.includes("postal_code"))?.long_name ||
            "",
        subpremise: data.find((x: TGoogleAddressDetails) => x.types.includes("subpremise"))
            ?.long_name,
    };
    return address;
};

export const useGetSuggestionsQuery = (suggestion: AutocompletePrediction | null) => {
    return useQuery({
        queryKey: ["address", suggestion?.description],
        queryFn: () => getAddressSuggestion(suggestion),
        enabled: !!suggestion,
    });
};
