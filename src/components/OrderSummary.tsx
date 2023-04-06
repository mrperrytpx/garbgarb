import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { useCompleteOrderMutation } from "../hooks/useCompleteOrderMutation";
import { cartSelector } from "../redux/slices/cartSlice";
import { useSelector } from "react-redux";
import { currency } from "../utils/currency";
import { TShippingRatesResp } from "../pages/api/printful/shipping_rates";
import { ValidatedAddress } from "../pages/checkout";
import { useFormContext } from "react-hook-form";

interface IOrderSummary {
  extraCosts: TShippingRatesResp | null;
}

export const OrderSummary = ({ extraCosts }: IOrderSummary) => {
  const productsInCart = useSelector(cartSelector);
  const completeOrderMutation = useCompleteOrderMutation();

  const { getValues } = useFormContext<ValidatedAddress>();

  return (
    <aside className="lg:max-w-1/4 sticky top-[70px] mx-auto flex w-full max-w-screen-md flex-1 flex-col rounded-lg bg-slate-100 p-4">
      <div className="flex flex-col items-start justify-center gap-4">
        <p className="text-xl font-bold">ORDER SUMMARY</p>
        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Subtotal:</p>
          <p className="text-sm">
            {currency(productsInCart.reduce((prev, curr) => +curr.price * curr.quantity + prev, 0))}
          </p>
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Estimated Shipping:</p>
          {extraCosts ? (
            <p className="text-sm">{currency(extraCosts?.shipping)}</p>
          ) : (
            <p className="text-sm font-bold">TBD</p>
          )}
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="text-sm">VAT:</p>
          {extraCosts ? (
            <p className="text-sm">
              {new Intl.NumberFormat("en-US", { style: "percent" }).format(extraCosts.vat - 1)}
            </p>
          ) : (
            <p className="text-sm font-bold">TBD</p>
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
          disabled={!extraCosts || completeOrderMutation.isLoading}
          onClick={() => completeOrderMutation.mutateAsync({ address: getValues() })}
          className="flex w-full items-center justify-center  gap-2 bg-white p-2 disabled:opacity-50"
          type="button"
        >
          {completeOrderMutation.isLoading && <LoadingSpinner />}
          <p>Go to Payment</p>
        </button>
      </div>
    </aside>
  );
};
