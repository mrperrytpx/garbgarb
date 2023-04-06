import usePlacesAutocomplete from "use-places-autocomplete";
import { useFormContext } from "react-hook-form";
import { ValidatedAddress } from "../pages/checkout";
import { useGetSuggestionsQuery } from "../hooks/useGetSuggestionsQuery";
import { AutocompletePrediction } from "react-places-autocomplete";
import { LoadingSpinner } from "./LoadingSpinner";

export type TAddress = {
  address1: string;
  address2?: string;
  zip: string | number;
  city: string;
  country_code: string;
};

export type TGoogleAddressDetails = {
  long_name: string;
  short_name: string;
  types: Array<string>;
};

interface IAddressFormProps {
  suggestion: AutocompletePrediction | null;
  setSuggestion: React.Dispatch<React.SetStateAction<AutocompletePrediction | null>>;
}

export const AddressForm = ({ suggestion, setSuggestion }: IAddressFormProps) => {
  const {
    ready,
    value,
    setValue,
    clearSuggestions,
    suggestions: { status, data },
  } = usePlacesAutocomplete({ debounce: 500, cacheKey: "address" });

  const {
    register,
    formState: { errors },
  } = useFormContext<ValidatedAddress>();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const addressData = useGetSuggestionsQuery(suggestion);

  return (
    <form className="relative min-h-[300px] p-2 lg:min-h-0">
      <fieldset className="flex w-full flex-col items-center gap-4">
        <div className="w-full">
          <label className="block p-1 text-sm" htmlFor="address1">
            <strong>Address</strong>
          </label>
          <input
            name="address1"
            id="address1"
            className="w-full border p-2"
            type="text"
            placeholder="Type and select Your address"
            onChange={handleInput}
            autoComplete="off"
            value={value}
            disabled={!ready}
          />
        </div>
        {suggestion && addressData.status !== "loading" && (
          <div className="mt-8 w-full">
            {addressData.data?.subpremise && (
              <div className="w-full">
                <label className="block p-1 text-sm" htmlFor="subpremise">
                  <strong>Subpremise</strong>
                </label>
                <input
                  {...(register("subpremise"),
                  {
                    value: addressData.data?.subpremise,
                  })}
                  name="subpremise"
                  id="subpremise"
                  className="w-full cursor-not-allowed border bg-slate-200  p-2"
                  type="text"
                  placeholder="Apartment, Suite, Unit etc."
                  autoComplete="off"
                  disabled={true}
                />
                {errors.subpremise && <span> {errors.subpremise.message}</span>}
              </div>
            )}
            <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="w-full flex-[2]">
                <label className="block p-1 text-sm" htmlFor="streetName">
                  <strong>Street name</strong>
                </label>
                <input
                  {...(register("streetName"),
                  {
                    value: addressData.data?.streetName || "",
                    required: true,
                  })}
                  name="streetName"
                  id="streetName"
                  className="w-full cursor-not-allowed border bg-slate-200  p-2"
                  type="text"
                  placeholder="Street Name"
                  disabled={true}
                  autoComplete="off"
                />
                {errors.streetName && <span> {errors.streetName.message}</span>}
              </div>
              <div className="ml-auto w-full flex-1">
                <label className="block p-1 text-sm" htmlFor="streetNumber">
                  <strong>Street Number</strong>
                </label>
                <input
                  {...(register("streetNumber"),
                  {
                    value: addressData.data?.streetNumber || "",
                    required: true,
                  })}
                  name="streetNumber"
                  id="streetNumber"
                  className="w-full cursor-not-allowed border bg-slate-200  p-2"
                  type="text"
                  placeholder="Street Number"
                  autoComplete="off"
                  disabled={true}
                />
                {errors.streetNumber && <span> {errors.streetNumber.message}</span>}
              </div>
            </div>
            <div className="w-full">
              <label className="block p-1 text-sm" htmlFor="city">
                <strong>City</strong>
              </label>
              <input
                {...(register("city"),
                {
                  value: addressData.data?.city || "",
                  required: true,
                })}
                name="city"
                id="city"
                className="w-full cursor-not-allowed border bg-slate-200  p-2"
                type="text"
                placeholder="City"
                autoComplete="off"
                disabled={true}
              />
              {errors.city && <span role="error"> {errors.city.message}</span>}
            </div>

            <div className="flex w-full flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <label className="block p-1 text-sm" htmlFor="country">
                  <strong>Country</strong>
                </label>
                <input
                  {...(register("country"),
                  {
                    value: addressData.data?.country || "",
                    required: true,
                  })}
                  name="country"
                  id="country"
                  className="w-full cursor-not-allowed border bg-slate-200  p-2"
                  type="text"
                  placeholder="Country"
                  autoComplete="off"
                  disabled={true}
                />
                {errors.country && <span> {errors.country.message}</span>}
              </div>
              <div className="w-full">
                <label className="block p-1 text-sm" htmlFor="province">
                  <strong>State / Province</strong>
                </label>
                <input
                  {...(register("province"),
                  {
                    value: addressData.data?.province || "",
                    required: true,
                  })}
                  name="province"
                  id="province"
                  className="w-full cursor-not-allowed border bg-slate-200 p-2"
                  type="text"
                  placeholder="State / Province"
                  autoComplete="off"
                  disabled={true}
                />
                {errors.province && <span> {errors.province.message}</span>}
              </div>
              <div className="w-full">
                <label className="block p-1 text-sm" htmlFor="zip">
                  <strong>Zip / Postal Code</strong>
                </label>
                <input
                  {...(register("zip"),
                  {
                    value: addressData.data?.zip || "",
                    required: true,
                  })}
                  name="zip"
                  id="zip"
                  className="w-full cursor-not-allowed border bg-slate-200 p-2"
                  type="text"
                  placeholder="Zip / Postal Code"
                  autoComplete="off"
                  disabled={true}
                />
                {errors.zip && <span> {errors.zip.message}</span>}
              </div>
            </div>
          </div>
        )}
      </fieldset>
      {addressData.isFetching ? (
        <div className="absolute top-[82px] left-0 z-20 w-full gap-0.5 bg-white px-2">
          <LoadingSpinner />
        </div>
      ) : (
        <ul className="absolute top-20 left-0 flex w-full flex-col gap-0.5 bg-white px-2">
          {status === "OK" &&
            data.map((suggestion, i) => (
              <li
                className="cursor-pointer rounded-md border-b-2 bg-slate-200 p-2 last-of-type:border-0"
                key={i}
                onClick={() => {
                  clearSuggestions();
                  setSuggestion(suggestion);
                }}
              >
                <strong>{suggestion.description}</strong>
              </li>
            ))}
        </ul>
      )}
    </form>
  );
};
