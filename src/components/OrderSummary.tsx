import React, { Dispatch, SetStateAction } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { cartSelector, removeFromCart, updateStock } from "../redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { currency } from "../utils/currency";
import { useGetExtraCostsQuery } from "../hooks/useGetExtraCostsQuery";
import { useCompleteOrderMutation } from "../hooks/useCompleteOrderMutation";
import { useFormContext } from "react-hook-form";
import { ValidatedAddress, ValidatedForm, validationSchema } from "../pages/checkout";
import { useMutation } from "@tanstack/react-query";
import { apiInstance } from "../utils/axiosClients";
import { TCheckoutPayload } from "../lib/checkPayloadStock";
import { TProductVariant } from "../pages/api/product";
import { toast } from "react-toastify";
import Link from "next/link";

interface IOrderSummaryProps {
    setCheckoutStep: Dispatch<SetStateAction<number>>;
}

export const OrderSummary = ({ setCheckoutStep }: IOrderSummaryProps) => {
    const productsInCart = useSelector(cartSelector);
    const dispatch = useDispatch();

    const { getValues } = useFormContext<ValidatedForm>();

    const formData = getValues();
    if (!validationSchema.parse(formData)) setCheckoutStep(3);

    const address: ValidatedAddress = {
        streetName: formData.streetName,
        streetNumber: formData.streetNumber,
        city: formData.city,
        country: formData.country,
        zip: formData.zip,
        subpremise: formData.subpremise,
    };
    const extraCosts = useGetExtraCostsQuery(address);

    const completeOrderMutation = useCompleteOrderMutation();

    const checkStockMutation = useMutation(
        async () => {
            const checkoutPayload: TCheckoutPayload = productsInCart.map((item) => ({
                store_product_id: item.store_product_id,
                store_product_variant_id: item.store_product_variant_id,
                quantity: item.quantity,
            }));

            const res = await apiInstance.post<
                | (TProductVariant & {
                      quantity: number;
                      in_stock: boolean;
                  })[]
                | null
            >("/api/printful/check_stock", {
                cartItems: checkoutPayload,
            });

            const data = res.data;
            return data;
        },
        {
            onSuccess: (data) => {
                if (data?.length === productsInCart.length) {
                    completeOrderMutation.mutate({
                        address: address,
                        email: formData.email,
                        name: formData.name,
                    });
                } else {
                    const itemsInStock = data?.filter((x) => x.in_stock).map((x) => x.id);
                    dispatch(updateStock(itemsInStock));
                    setCheckoutStep(2);
                }
            },
        }
    );

    const formattedAddress = `${formData.streetNumber} ${formData.streetName}, ${formData.city}, ${formData.zip}-${formData.country}`;

    return (
        <aside className=" mx-auto flex w-full max-w-screen-md flex-col rounded-lg p-2 font-medium text-gray-200">
            <div className="flex flex-col items-start justify-center gap-3">
                <h1 className="mb-2 w-full border-b border-slate-200 text-xl font-bold">
                    ORDER SUMMARY
                </h1>

                <div className="flex w-full flex-col items-start justify-between gap-0.5 xs:flex-row">
                    <p className="text-sm uppercase">Name:</p>
                    <p className="text-sm">{formData.name}</p>
                </div>
                <div className="flex w-full flex-col items-start justify-between gap-0.5 xs:flex-row">
                    <p className="text-sm uppercase">Email:</p>
                    <p className="text-sm">{formData.email}</p>
                </div>
                <div className="flex w-full flex-col items-start justify-between gap-0.5 xs:flex-row">
                    <p className="text-sm uppercase">Address:</p>
                    {formData.streetName && <p className="text-sm">{formattedAddress}</p>}
                </div>
                <div className="flex w-full flex-col items-start justify-between gap-0.5 xs:flex-row">
                    <p className="text-sm uppercase">Items:</p>
                    <div className="flex flex-col gap-0.5 rounded-md">
                        {productsInCart.map((product) => (
                            <p
                                onClick={() => {
                                    if (product.outOfStock) {
                                        dispatch(removeFromCart({ sku: product.sku }));
                                        toast.success("Removed from cart.");
                                    }
                                }}
                                className={`text-xs xs:text-right ${
                                    product.outOfStock ? "line-through" : ""
                                } ${product.outOfStock ? "cursor-pointer" : "cursor-default"} ${
                                    product.outOfStock ? "shadow" : "shadow-none"
                                } ${product.outOfStock ? "bg-white" : "bg-none"}`}
                                key={product.sku}
                            >
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
                            productsInCart.reduce((prev, curr) => {
                                if (curr.outOfStock) return prev + 0;
                                return +curr.price * curr.quantity + prev;
                            }, 0)
                        )}
                    </p>
                </div>
                <div className="flex w-full flex-wrap items-center justify-between">
                    <p className="text-sm uppercase">Est. Shipping:</p>
                    {extraCosts.isFetching ? (
                        <LoadingSpinner size={12} />
                    ) : extraCosts.data ? (
                        <p className="text-sm font-bold">{currency(extraCosts.data?.shipping)}</p>
                    ) : (
                        <p className="text-sm font-bold">
                            {extraCosts.isError ? "Couldn't estimate the price 💀" : "TBD"}
                        </p>
                    )}
                </div>
                <div className="flex w-full items-center justify-between">
                    <p className="text-sm uppercase">VAT:</p>
                    {extraCosts.isFetching ? (
                        <LoadingSpinner size={12} />
                    ) : extraCosts.data ? (
                        <p className="text-sm font-bold">
                            {new Intl.NumberFormat("en-US", { style: "percent" }).format(
                                extraCosts.data.vat - 1
                            )}
                        </p>
                    ) : (
                        <p className="text-sm font-bold">
                            {extraCosts.isError ? "Couldn't estimate the price 💀" : "TBD"}
                        </p>
                    )}
                </div>
                <div className="w-full border-t-2">
                    <div className="mt-4 flex w-full items-center justify-between">
                        <p className="text-lg uppercase">
                            <strong>Est. Total:</strong>
                        </p>
                        {extraCosts.data ? (
                            <p className="text-lg">
                                <strong>
                                    {currency(
                                        productsInCart.reduce((prev, curr) => {
                                            if (curr.outOfStock) return prev + 0;
                                            return +curr.price * curr.quantity + prev;
                                        }, 0) *
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
                                        productsInCart.reduce((prev, curr) => {
                                            if (curr.outOfStock) return prev + 0;
                                            return +curr.price * curr.quantity + prev;
                                        }, 0)
                                    )}
                                </strong>
                            </p>
                        )}
                    </div>
                    <Link
                        href="/static/returns-faq#fees"
                        className="inline-block text-xs underline hover:animate-hop focus:animate-hop"
                    >
                        *Customers may be subject to additional customs fees
                    </Link>
                </div>

                <button
                    disabled={
                        !extraCosts.data ||
                        extraCosts.isFetching ||
                        completeOrderMutation.isLoading ||
                        checkStockMutation.isLoading ||
                        !!productsInCart.filter((x) => x.outOfStock).length ||
                        completeOrderMutation.isError
                    }
                    onClick={() => checkStockMutation.mutate()}
                    className="hover mt-8 flex w-full items-center justify-center gap-2 self-center rounded-lg border border-slate-500 bg-black p-2 enabled:shadow-sm enabled:shadow-slate-500 enabled:hover:animate-hop enabled:hover:bg-slate-200 enabled:hover:text-black enabled:focus:animate-hop enabled:focus:bg-slate-200 enabled:focus:text-black disabled:opacity-50"
                    type="button"
                >
                    {completeOrderMutation.isLoading && <LoadingSpinner size={28} />}
                    {checkStockMutation.isLoading && <LoadingSpinner size={28} />}
                    {!!productsInCart.filter((x) => x.outOfStock).length
                        ? "Remove out of stock items"
                        : completeOrderMutation.isError
                        ? "Error 💀"
                        : "Go to Payment"}
                </button>
            </div>
        </aside>
    );
};
