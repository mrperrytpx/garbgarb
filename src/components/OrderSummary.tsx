import React, { Dispatch, SetStateAction } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { cartSelector } from "../redux/slices/cartSlice";
import { useSelector } from "react-redux";
import { currency } from "../utils/currency";
import { AutocompletePrediction } from "react-places-autocomplete";
import { useGetSuggestionsQuery } from "../hooks/useGetSuggestionsQuery";
import { useGetExtraCostsQuery } from "../hooks/useGetExtraCostsQuery";
import { useCompleteOrderMutation } from "../hooks/useCompleteOrderMutation";
import { useFormContext } from "react-hook-form";
import { ValidatedForm, validationSchema } from "../pages/checkout";

interface IOrderSummaryProps {
    suggestion: AutocompletePrediction | null;
    setCheckoutStep: Dispatch<SetStateAction<number>>;
}

export const OrderSummary = ({ suggestion, setCheckoutStep }: IOrderSummaryProps) => {
    const productsInCart = useSelector(cartSelector);

    const { data: addressData } = useGetSuggestionsQuery(suggestion);
    const extraCosts = useGetExtraCostsQuery(addressData);
    const completeOrderMutation = useCompleteOrderMutation();

    const { getValues } = useFormContext<ValidatedForm>();

    const formData = getValues();
    if (!validationSchema.parse(formData)) setCheckoutStep(3);

    const formattedAddress = `${formData.streetNumber} ${formData.streetName}, ${formData.city}, ${formData.province}, ${formData.zip}-${formData.country}`;

    return (
        <aside className=" mx-auto flex w-full max-w-screen-md flex-col rounded-lg bg-slate-100 p-4 font-medium">
            <div className="flex flex-col items-start justify-center gap-4">
                <h1 className="w-full border-b border-slate-300 text-xl font-bold">
                    ORDER SUMMARY
                </h1>

                <div className="flex w-full flex-col items-start justify-between gap-0.5 sm:flex-row">
                    <p className="text-sm uppercase">Address:</p>
                    {formData.streetName && <p className="text-sm">{formattedAddress}</p>}
                </div>
                <div className="flex w-full flex-col items-start justify-between gap-0.5 sm:flex-row">
                    <p className="text-sm uppercase">Email:</p>
                    <p className="text-sm">{formData.email}</p>
                </div>
                <div className="flex w-full flex-col items-start justify-between gap-0.5 sm:flex-row">
                    <p className="text-sm uppercase">Items:</p>
                    <div className="flex flex-col gap-0.5 rounded-md">
                        {productsInCart.map((product) => (
                            <p className="text-xs sm:text-right" key={product.sku}>
                                {product.name}, ({product.size} - {product.color_name}),{" "}
                                <strong>x{product.quantity}</strong>
                            </p>
                        ))}
                    </div>
                </div>
                <div className="flex w-full items-center justify-between">
                    <p className="text-sm uppercase">Subtotal:</p>
                    <p className="text-sm font-bold">
                        {currency(
                            productsInCart.reduce(
                                (prev, curr) => +curr.price * curr.quantity + prev,
                                0
                            )
                        )}
                    </p>
                </div>
                <div className="flex w-full items-center justify-between">
                    <p className="text-sm uppercase">Est. Shipping:</p>
                    {extraCosts.isLoading && extraCosts.fetchStatus !== "idle" ? (
                        <LoadingSpinner size={12} />
                    ) : extraCosts.data ? (
                        <p className="text-sm font-bold">{currency(extraCosts.data?.shipping)}</p>
                    ) : (
                        <p className="text-sm font-bold">{extraCosts.isError ? "💀" : "TBD"}</p>
                    )}
                </div>
                <div className="flex w-full items-center justify-between">
                    <p className="text-sm uppercase">VAT:</p>
                    {extraCosts.isLoading && extraCosts.fetchStatus !== "idle" ? (
                        <LoadingSpinner size={12} />
                    ) : extraCosts.data ? (
                        <p className="text-sm font-bold">
                            {new Intl.NumberFormat("en-US", { style: "percent" }).format(
                                extraCosts.data.vat - 1
                            )}
                        </p>
                    ) : (
                        <p className="text-sm font-bold">{extraCosts.isError ? "💀" : "TBD"}</p>
                    )}
                </div>
                <div className="w-full border-t-2">
                    <div className="flex w-full items-center justify-between">
                        <p className="text-lg uppercase">
                            <strong>Est. Total:</strong>
                        </p>
                        {extraCosts.data ? (
                            <p className="text-lg">
                                <strong>
                                    {currency(
                                        productsInCart.reduce(
                                            (prev, curr) => +curr.price * curr.quantity + prev,
                                            0
                                        ) *
                                            extraCosts.data?.vat +
                                            +extraCosts.data.shipping
                                    )}
                                    *
                                </strong>
                            </p>
                        ) : (
                            <p className="text-lg">
                                <strong>
                                    {currency(
                                        productsInCart.reduce(
                                            (prev, curr) => +curr.price * curr.quantity + prev,
                                            0
                                        )
                                    )}
                                </strong>
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs underline">
                            *Customers may be subject to additional customs fees
                        </p>
                    </div>
                </div>

                <button
                    disabled={
                        !extraCosts.data || extraCosts.isFetching || completeOrderMutation.isLoading
                    }
                    onClick={() =>
                        completeOrderMutation.mutateAsync({
                            address: addressData,
                            email: formData.email,
                        })
                    }
                    className="flex w-full items-center justify-center gap-2 self-center rounded-lg bg-white  p-2 shadow-md disabled:opacity-50 sm:w-52"
                    type="button"
                >
                    {completeOrderMutation.isLoading && <LoadingSpinner size={24} />}
                    <p>Go to Payment</p>
                </button>
            </div>
        </aside>
    );
};
