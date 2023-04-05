import React, { useState } from "react";
import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { Libraries } from "use-google-maps-script/dist/utils/createUrl";
import { useGoogleMapsScript } from "use-google-maps-script";
import usePlacesAutocomplete from "use-places-autocomplete";
import { SectionSeparator } from "../../components/SectionSeparator";
import { MinimalCartProduct } from "../../components/MinimalCartProduct";
import { currency } from "../../utils/currency";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TShippingRatesResp } from "../api/printful/shipping_rates";
import { useAddressSuggestionMutation } from "../../hooks/useAddressSuggestionMutation";
import { useCompleteOrderMutation } from "../../hooks/useCompleteOrderMutation";

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

const validationSchema = z.object({
  city: z.string().min(1, { message: "City is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  province: z.string().min(1, { message: "State / Province is required" }),
  zip: z.string().min(1, { message: "Zip / Postal Code is required" }),
  streetName: z.string().min(1, { message: "Street Name is required" }),
  streetNumber: z.string().min(1, { message: "Street Number is required" }),
  subpremise: z.string().optional(),
});

export type ValidatedAddress = z.infer<typeof validationSchema>;

const Form = () => {
  const [address, setAddress] = useState<TGoogleAddressDetails[]>([]);
  const [extraCosts, setExtraCosts] = useState<TShippingRatesResp | null>(null);
  const productsInCart = useSelector(cartSelector);

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 500 });

  const {
    register,
    formState: { errors },
    setValue: setFormValue,
    getValues,
  } = useForm<ValidatedAddress>({
    resolver: zodResolver(validationSchema),
  });

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

  const completeOrderMutation = useCompleteOrderMutation();

  return (
    <div className="mx-auto mb-6 flex w-full max-w-screen-lg flex-col items-start gap-2 lg:flex-row lg:gap-6">
      <main className="lg:max-w-3/4 mx-auto flex w-full max-w-screen-md flex-[3] flex-col gap-4">
        <div>
          <SectionSeparator name="Cart overview" number="1" />
          <div className="flex w-full flex-col items-center gap-1 sm:p-2">
            {productsInCart.map((item) => (
              <MinimalCartProduct key={item.sku} item={item} />
            ))}
          </div>
        </div>
        <div>
          <SectionSeparator name="Shipping Address" number="2" />
          <form className="min-h-[600px] md:min-h-[350px]">
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
                  <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row">
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

                  <div className="flex w-full flex-col gap-4 md:flex-row">
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
        </div>
      </main>
      <aside className="lg:max-w-1/4 sticky top-[70px] mx-auto flex w-full max-w-screen-md flex-1 flex-col rounded-lg bg-slate-100 p-4">
        <div className="flex flex-col items-start justify-center gap-4">
          <p className="text-xl font-bold">ORDER SUMMARY</p>
          <div className="flex w-full items-center justify-between">
            <p className="text-sm">Subtotal:</p>
            <p className="text-sm">
              {currency(
                productsInCart.reduce((prev, curr) => +curr.price * curr.quantity + prev, 0)
              )}
            </p>
          </div>
          <div className="flex w-full items-center justify-between">
            <p className="text-sm">Estimated Shipping:</p>
            {extraCosts && <p className="text-sm">{currency(extraCosts?.shipping)}</p>}
          </div>
          <div className="flex w-full items-center justify-between">
            <p className="text-sm">VAT:</p>
            {extraCosts && (
              <p className="text-sm">
                {new Intl.NumberFormat("en-US", { style: "percent" }).format(extraCosts.vat - 1)}
              </p>
            )}
          </div>
          <div className="flex w-full items-center justify-between">
            <p className="uppercase">
              <strong>Estimated Total:</strong>
            </p>
            {extraCosts ? (
              <p>
                <strong>
                  {currency(
                    productsInCart.reduce((prev, curr) => +curr.price * curr.quantity + prev, 0) *
                      extraCosts?.vat +
                      +extraCosts.shipping
                  )}
                </strong>
              </p>
            ) : (
              <p>
                <strong>
                  {currency(
                    productsInCart.reduce((prev, curr) => +curr.price * curr.quantity + prev, 0)
                  )}
                </strong>
              </p>
            )}
          </div>
          <button
            disabled={!extraCosts}
            onClick={() => completeOrderMutation.mutateAsync({ address: getValues() })}
            className="w-full bg-white p-2  disabled:opacity-50 "
            type="button"
          >
            Payment
          </button>
        </div>
      </aside>
    </div>
  );
};

const libraries: Libraries = ["places"];

const CheckoutPage = () => {
  const productsInCart = useSelector(cartSelector);
  const router = useRouter();

  const { isLoaded, loadError } = useGoogleMapsScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries,
  });

  if (!productsInCart.length) {
    router.push("/products");
    return <div>Redirecting to shop</div>;
  }

  if (!isLoaded) return <div>Loading google...</div>;
  if (loadError) return <div>Something is wrong... try reloading the page</div>;

  return <Form />;
};

export default CheckoutPage;
