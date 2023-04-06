import usePlacesAutocomplete from "use-places-autocomplete";
import { TShippingRatesResp } from "../pages/api/printful/shipping_rates";
import { useAddressSuggestionMutation } from "../hooks/useAddressSuggestionMutation";
import { LoadingSpinner } from "./LoadingSpinner";
import { useFormContext } from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";
import { ValidatedAddress } from "../pages/checkout";

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
  setExtraCosts: Dispatch<SetStateAction<TShippingRatesResp | null>>;
}

export const getFormValues = (form: any) => form.getValues();

export const AddressForm = ({ setExtraCosts }: IAddressFormProps) => {
  const [address, setAddress] = useState<TGoogleAddressDetails[]>([]);

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 500 });

  const {
    register,
    setValue: setFormValue,
    getValues,
    formState: { errors },
  } = useFormContext<ValidatedAddress>();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setAddress([]);
  };

  const addressSuggestionMutation = useAddressSuggestionMutation(
    setExtraCosts,
    setAddress,
    setFormValue,
    getValues,
    clearSuggestions
  );

  return (
    <form className="min-h-[300px] lg:min-h-0">
      <fieldset className="relative flex w-full flex-col items-center gap-4 p-2 ">
        <div className="w-full">
          <label className="block p-1 text-sm" htmlFor="address1">
            <strong>Address</strong>
          </label>
          <input
            name="address1"
            id="address1"
            className="w-full border p-2"
            type="text"
            placeholder="Type your address"
            onChange={handleInput}
            autoComplete="off"
            value={value}
            disabled={!ready}
          />
        </div>
        {addressSuggestionMutation.isLoading && <LoadingSpinner />}
        {address.length ? (
          <>
            {address.find((x) => x.types.includes("subpremise")) && (
              <div className="w-full">
                <label className="block p-1 text-sm" htmlFor="subpremise">
                  <strong>Subpremise</strong>
                </label>
                <input
                  {...register("subpremise")}
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
                  {...register("streetName")}
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
                  {...register("streetNumber")}
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
                {...register("city")}
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
                  {...register("country")}
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
                  {...register("province")}
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
                  {...register("zip")}
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
          </>
        ) : null}
      </fieldset>
      <ul className="flex w-full flex-col gap-0.5 p-2">
        {status === "OK" &&
          data.map((suggestion, i) => (
            <li
              className="cursor-pointer rounded-lg bg-slate-100 p-4"
              key={i}
              onClick={() => addressSuggestionMutation.mutateAsync({ suggestion })}
            >
              <strong>{suggestion.description}</strong>
            </li>
          ))}
      </ul>
    </form>
  );
};
