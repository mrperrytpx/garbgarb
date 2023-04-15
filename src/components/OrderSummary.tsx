import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { cartSelector } from "../redux/slices/cartSlice";
import { useSelector } from "react-redux";
import { currency } from "../utils/currency";
import { AutocompletePrediction } from "react-places-autocomplete";
import { useGetSuggestionsQuery } from "../hooks/useGetSuggestionsQuery";
import { useGetExtraCostsQuery } from "../hooks/useGetExtraCostsQuery";
import { useCompleteOrderMutation } from "../hooks/useCompleteOrderMutation";
import { useFormContext } from "react-hook-form";
import { ValidatedForm } from "../pages/checkout";

interface IOrderSummaryProps {
  suggestion: AutocompletePrediction | null;
}

export const OrderSummary = ({ suggestion }: IOrderSummaryProps) => {
  const productsInCart = useSelector(cartSelector);

  const { data: addressData } = useGetSuggestionsQuery(suggestion);
  const extraCosts = useGetExtraCostsQuery(addressData);

  const { getValues } = useFormContext<ValidatedForm>();

  const formData = getValues();
  const formattedAddress = `${formData.streetNumber} ${formData.streetName}, ${formData.city}, ${formData.province}, ${formData.zip}-${formData.country}`;

  const completeOrderMutation = useCompleteOrderMutation();

  return (
    <aside className=" mx-auto flex w-full max-w-screen-md flex-col rounded-lg bg-slate-100 p-4">
      <div className="flex flex-col items-start justify-center gap-4">
        <h1 className="text-xl font-bold">ORDER SUMMARY</h1>
        <div className="flex w-full flex-col items-start justify-between gap-0.5 sm:flex-row">
          <p className="text-sm">Address:</p>
          <p className="text-sm">{formattedAddress}</p>
        </div>
        <div className="flex w-full flex-col items-start justify-between gap-0.5 sm:flex-row">
          <p className="text-sm">Email:</p>
          <p className="text-sm">{formData.email}</p>
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Subtotal:</p>
          <p className="text-sm font-bold">
            {currency(productsInCart.reduce((prev, curr) => +curr.price * curr.quantity + prev, 0))}
          </p>
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Estimated Shipping:</p>
          {extraCosts.isLoading && extraCosts.fetchStatus !== "idle" ? (
            <LoadingSpinner size={12} />
          ) : extraCosts.data ? (
            <p className="text-sm font-bold">{currency(extraCosts.data?.shipping)}</p>
          ) : (
            <p className="text-sm font-bold">TBD</p>
          )}
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="text-sm">VAT:</p>
          {extraCosts.isLoading && extraCosts.fetchStatus !== "idle" ? (
            <LoadingSpinner size={12} />
          ) : extraCosts.data ? (
            <p className="text-sm font-bold">
              {new Intl.NumberFormat("en-US", { style: "percent" }).format(extraCosts.data.vat - 1)}
            </p>
          ) : (
            <p className="text-sm font-bold">TBD</p>
          )}
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="uppercase">
            <strong>Estimated Total:</strong>
          </p>
          {extraCosts.data ? (
            <p>
              <strong>
                {currency(
                  productsInCart.reduce((prev, curr) => +curr.price * curr.quantity + prev, 0) *
                    extraCosts.data?.vat +
                    +extraCosts.data.shipping
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
          disabled={!extraCosts.data || extraCosts.isFetching || completeOrderMutation.isLoading}
          onClick={() => completeOrderMutation.mutateAsync({ address: addressData })}
          className="flex w-full items-center justify-center  gap-2 bg-white p-2 disabled:opacity-50"
          type="button"
        >
          {completeOrderMutation.isLoading && <LoadingSpinner size={24} />}
          <p>Go to Payment</p>
        </button>
      </div>
    </aside>
  );
};
