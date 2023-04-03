import React, { useState } from "react";
import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { Libraries } from "use-google-maps-script/dist/utils/createUrl";
import { useGoogleMapsScript } from "use-google-maps-script";
import usePlacesAutocomplete, { getGeocode } from "use-places-autocomplete";
import { SectionSeparator } from "../../components/SectionSeparator";
import { MinimalCartProduct } from "../../components/MinimalCartProduct";
import { currency } from "../../utils/currency";

export type TAddress = {
  address1: string;
  address2?: string;
  zip: string | number;
  city: string;
  country_code: string;
};

type TGoogleAddressDetails = {
  long_name: string;
  short_name: string;
  types: Array<string>;
};

const Form = () => {
  const [address, setAddress] = useState<TGoogleAddressDetails[]>([]);
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
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setAddress([]);
  };

  const handleSelect = async (suggestion: any) => {
    console.log("SELECTED: ", suggestion);
    clearSuggestions();
    const deets = await getGeocode({ placeId: suggestion.place_id });
    setAddress(deets[0].address_components as TGoogleAddressDetails[]);
    console.log("TEST deets", deets);
  };

  const onSubmit = () => console.log("submitting");

  return (
    <div className="mx-auto mb-6 flex w-full max-w-screen-lg flex-1 flex-col items-start gap-2 lg:flex-row lg:gap-6">
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="relative flex w-full flex-col items-center gap-4 p-2 ">
              <div className="w-full">
                <label className="block p-1 text-sm" htmlFor="address1">
                  <strong>Address</strong>
                </label>
                <input
                  name="address1"
                  className="w-full border p-2"
                  {...(register("address1"),
                  {
                    required: true,
                  })}
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
                        name="subpremise"
                        className="w-full cursor-not-allowed border bg-slate-200  p-2"
                        {...(register("subpremise"),
                        {
                          required: !!address.find((x) => x.types.includes("subpremise")),
                          value: address.find((x) => x.types.includes("subpremise"))?.long_name,
                          readOnly: true,
                        })}
                        type="text"
                        placeholder="Apartment, Suite, Unit etc."
                        autoComplete="off"
                      />
                    </div>
                  )}
                  <div className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
                    <div className="w-full flex-[3]">
                      <label className="block p-1 text-sm" htmlFor="streetName">
                        <strong>Street name</strong>
                      </label>
                      <input
                        name="streetName"
                        className="w-full cursor-not-allowed border bg-slate-200  p-2"
                        {...(register("streetName"),
                        {
                          required: true,
                          value: address.find((x) => x.types.includes("route"))?.long_name,
                          readOnly: true,
                        })}
                        type="text"
                        placeholder="Street Name"
                        autoComplete="off"
                      />
                    </div>
                    <div className="w-full flex-1">
                      <label className="block p-1 text-sm" htmlFor="streetNumber">
                        <strong>Street Number</strong>
                      </label>
                      <input
                        name="streetNumber"
                        className="w-full cursor-not-allowed border bg-slate-200  p-2"
                        {...(register("streetNumber"),
                        {
                          required: true,
                          value: address.find((x) => x.types.includes("street_number"))?.long_name,
                          readOnly: true,
                        })}
                        type="text"
                        placeholder="Street Number"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="block p-1 text-sm" htmlFor="city">
                      <strong>City</strong>
                    </label>
                    <input
                      name="city"
                      className="w-full cursor-not-allowed border bg-slate-200  p-2"
                      {...(register("city"),
                      {
                        required: true,
                        value: address.find((x) => x.types.includes("locality"))?.long_name,
                        readOnly: true,
                      })}
                      type="text"
                      placeholder="City"
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex w-full flex-col gap-4 md:flex-row">
                    <div className="w-full">
                      <label className="block p-1 text-sm" htmlFor="country">
                        <strong>Country</strong>
                      </label>
                      <input
                        name="country"
                        className="w-full cursor-not-allowed border bg-slate-200  p-2"
                        {...(register("country"),
                        {
                          required: true,
                          value: address.find((x) => x.types.includes("country"))?.long_name,
                          readOnly: true,
                        })}
                        type="text"
                        placeholder="Country"
                        autoComplete="off"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block p-1 text-sm" htmlFor="province">
                        <strong>State / Province</strong>
                      </label>
                      <input
                        name="province"
                        className="w-full cursor-not-allowed border bg-slate-200 p-2"
                        {...(register("province"),
                        {
                          required: true,
                          value: address.find((x) =>
                            x.types.includes("administrative_area_level_1")
                          )?.long_name,
                          readOnly: true,
                        })}
                        type="text"
                        placeholder="State / Province"
                        autoComplete="off"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block p-1 text-sm" htmlFor="zip">
                        <strong>Zip / Postal Code</strong>
                      </label>
                      <input
                        name="zip"
                        className="w-full cursor-not-allowed border bg-slate-200 p-2"
                        {...(register("zip"),
                        {
                          required: true,
                          value: address.find((x) => x.types.includes("postal_code"))?.long_name,
                          readOnly: true,
                        })}
                        type="text"
                        placeholder="Zip / Postal Code"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </fieldset>
            <ul className="flex w-full flex-col gap-0.5 p-2">
              {status === "OK" &&
                data.map((suggestion, i) => (
                  <li
                    className="cursor-pointer rounded-lg bg-slate-100 p-4
                  "
                    key={i}
                    onClick={() => handleSelect(suggestion)}
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
            <p className="text-sm">API</p>
          </div>
          <div className="flex w-full items-center justify-between">
            <p className="text-sm">VAT:</p>
            <p className="text-sm">API</p>
          </div>
          <div className="flex w-full items-center justify-between">
            <p className="uppercase">
              <strong>Estimated Total:</strong>
            </p>
            <p>
              <strong>right</strong>
            </p>
          </div>
          <button className="w-full bg-white p-2" type="button">
            Finish
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
    return <div className="flex-1">Redirecting to shop</div>;
  }

  if (!isLoaded) return <div>Loading google...</div>;
  if (loadError) return <div>Something is wrong... try reloading the page</div>;

  return <Form />;
};

export default CheckoutPage;
