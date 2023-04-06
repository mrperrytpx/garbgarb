import React, { useEffect } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { cartSelector } from "../redux/slices/cartSlice";
import { useSelector } from "react-redux";
import { currency } from "../utils/currency";
import { ValidatedAddress } from "../pages/checkout";
import { useFormContext } from "react-hook-form";

export const OrderSummary = ({ address }: { address: ValidatedAddress }) => {
  const productsInCart = useSelector(cartSelector);

  return (
    <aside className="lg:max-w-1/4 sticky top-[70px] mx-auto flex w-full max-w-screen-md flex-1 flex-col rounded-lg bg-slate-100 p-4">
      {/* {JSON.stringify(extraCostsQuery.data)}
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
          {extraCostsQuery.data ? (
            <p className="text-sm">{currency(extraCostsQuery.data?.shipping)}</p>
          ) : (
            <p className="text-sm font-bold">TBD</p>
          )}
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="text-sm">VAT:</p>
          {extraCostsQuery.data ? (
            <p className="text-sm">
              {new Intl.NumberFormat("en-US", { style: "percent" }).format(
                extraCostsQuery.data.vat - 1
              )}
            </p>
          ) : (
            <p className="text-sm font-bold">TBD</p>
          )}
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="uppercase">
            <strong>Estimated Total:</strong>
          </p>
          {extraCostsQuery.data ? (
            <p>
              <strong>
                {currency(
                  productsInCart.reduce((prev, curr) => +curr.price * curr.quantity + prev, 0) *
                    extraCostsQuery.data?.vat +
                    +extraCostsQuery.data.shipping
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
          disabled={!extraCostsQuery.data || completeOrderMutation.isLoading}
          onClick={() => completeOrderMutation.mutateAsync({ address: getValues() })}
          className="flex w-full items-center justify-center  gap-2 bg-white p-2 disabled:opacity-50"
          type="button"
        >
          {completeOrderMutation.isLoading && <LoadingSpinner />}
          <p>Go to Payment</p>
        </button>
      </div> */}
    </aside>
  );
};
