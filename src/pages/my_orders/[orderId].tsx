import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { apiInstance } from "../../utils/axiosClients";
import { TOrderResponse } from "../api/stripe/webhooks";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { currency } from "../../utils/currency";
import { Accordion } from "../../components/Accordion";
import { IoArrowBackSharp } from "react-icons/io5";
import Link from "next/link";
import { useCancelOrderMutation } from "../../hooks/useCancelOrderMutation";
import Stripe from "stripe";
import { MinimalCartProduct } from "../../components/MinimalCartProduct";

const OrderPage = () => {
    const router = useRouter();
    const { orderId } = router.query;

    const orderData = useQuery({
        queryKey: ["order", orderId],
        queryFn: async () => {
            const res = await apiInstance.get<TOrderResponse>("/api/printful/get_order", {
                params: {
                    orderId,
                },
            });
            const data = res.data.result;
            return data;
        },
        enabled: !!orderId,
    });

    const invoiceMutation = useMutation({
        mutationFn: async ({ orderId }: { orderId: string | string[] | undefined }) => {
            const res = await apiInstance.post<Stripe.Response<Stripe.Invoice>>(
                "/api/stripe/resend_invoice",
                {
                    orderId,
                }
            );
            const data = res.data;
            return data;
        },
    });

    const cancelOrderMutation = useCancelOrderMutation();
    if (!orderId) return null;

    const shippingAddress = `${orderData.data?.recipient.address1}${
        orderData.data?.recipient.address2 ? " " + orderData.data?.recipient.address2 : ""
    }, ${orderData.data?.recipient.city}, ${orderData.data?.recipient.zip}-${
        orderData.data?.recipient.country_code
    }`;

    if (orderData.isLoading)
        return (
            <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-2 text-white">
                <p className="text-sm font-semibold">Loading order {orderId}...</p>
                <LoadingSpinner size={50} />
            </div>
        );

    if (orderData.isError)
        return (
            <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-2 text-white">
                <p className="text-sm font-semibold">Couldn't find order #{orderId}</p>
                <p className="text-lg font-semibold">😥</p>
                <Link
                    href="/my_orders"
                    className="rounded-lg border p-2 font-semibold text-white hover:bg-slate-200 hover:text-black"
                >
                    Back to profile
                </Link>
            </div>
        );

    return (
        <div className="mx-auto my-4 mb-10 flex w-full max-w-screen-sm flex-1 flex-col gap-2 text-white">
            <div className="flex items-center justify-between px-2 ">
                <Link
                    className="group rounded-lg p-2 shadow shadow-slate-100 hover:bg-slate-200"
                    href="/my_orders"
                >
                    <IoArrowBackSharp className="group-hover:stroke-black" size="28" />
                </Link>
                <h1 className="text-xl font-bold underline">#{orderId}</h1>
            </div>
            <div className="my-4 mb-10 flex flex-col gap-4 px-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm uppercase">Order Status:</strong>
                    <strong className="text-sm uppercase">{orderData.data?.status}</strong>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    {orderData.data?.status !== "canceled" ? (
                        <>
                            <strong className="text-sm uppercase">Order Placed:</strong>
                            <p className="text-sm">
                                {new Intl.DateTimeFormat("en-GB", {
                                    weekday: "short",
                                    year: "2-digit",
                                    month: "short",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                }).format(orderData.data?.created || 1 * 1000)}
                            </p>
                        </>
                    ) : (
                        <>
                            <strong className="text-sm uppercase">Order Canceled:</strong>
                            <p className="text-sm">
                                {new Intl.DateTimeFormat("en-GB", {
                                    weekday: "short",
                                    year: "2-digit",
                                    month: "short",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                }).format(orderData.data?.updated * 1000)}
                            </p>
                        </>
                    )}
                </div>
                <div
                    style={{
                        opacity: orderData.data?.status === "canceled" ? "0.6" : "1",
                    }}
                    className="flex flex-col gap-2"
                >
                    <Accordion title="Customer Info:">
                        <div className="mb-2 flex flex-col gap-2 border-b-2 px-2 text-sm last-of-type:border-b-0">
                            <div className="flex flex-col flex-wrap items-start justify-between xs:flex-row xs:items-center">
                                <strong>Name:</strong>
                                <p className="">{orderData.data?.recipient.name}</p>
                            </div>
                            <div className="flex flex-col flex-wrap items-start justify-between xs:flex-row xs:items-center">
                                <strong>Email:</strong>
                                <p className="">{orderData.data?.recipient.email}</p>
                            </div>
                            <div className="flex flex-col flex-wrap items-start justify-between xs:flex-row xs:items-center">
                                <strong>Phone:</strong>
                                <p className="">{orderData.data?.recipient.phone}</p>
                            </div>
                            <div className="flex flex-col flex-wrap items-start justify-between xs:flex-row xs:items-center">
                                <strong>Address:</strong>
                                <p className="">{shippingAddress}</p>
                            </div>
                        </div>
                    </Accordion>
                    <Accordion title="Ordered items:">
                        <>
                            {orderData.data?.items.map((item) => (
                                <MinimalCartProduct item={item} key={item.id} />
                            ))}
                        </>
                    </Accordion>
                    <Accordion title="Shipping:">
                        <div className="mb-2 flex flex-col gap-2 border-b-2 px-2 text-sm last-of-type:border-b-0">
                            <div className="flex flex-col flex-wrap items-start justify-between xs:flex-row xs:items-center">
                                <strong>Shipping Type:</strong>
                                <p>{orderData.data?.shipping}</p>
                            </div>
                            <div className="flex flex-col flex-wrap items-start justify-between xs:flex-row xs:items-center">
                                <strong>Shipping Address:</strong>
                                <p>{shippingAddress}</p>
                            </div>
                            <div className="flex flex-col flex-wrap items-start justify-between xs:flex-row xs:items-center">
                                <strong>Shipping Name:</strong>
                                <p>{orderData.data?.shipping_service_name}</p>
                            </div>
                        </div>
                    </Accordion>
                    <Accordion title="Pricing breakdown:">
                        <div className="mb-2 flex flex-col gap-2 border-b-2 px-2 text-sm last-of-type:border-b-0">
                            <div className="flex flex-wrap items-center justify-between">
                                <p>Subtotal:</p>
                                <strong className="">
                                    {currency(orderData.data?.retail_costs.subtotal!)}
                                </strong>
                            </div>
                            <div className="flex flex-wrap items-center justify-between">
                                <p>Shipping:</p>
                                <strong className="">
                                    {currency(orderData.data?.retail_costs.shipping!)}
                                </strong>
                            </div>
                            <div className="flex flex-wrap items-center justify-between">
                                <p>Tax / VAT:</p>
                                <strong className="">
                                    {currency(orderData.data?.retail_costs.tax!)}
                                </strong>
                            </div>
                            <div className="flex flex-wrap items-center justify-between">
                                <p>Total:</p>
                                <strong className="">
                                    {currency(orderData.data?.retail_costs.total!)}
                                </strong>
                            </div>
                        </div>
                    </Accordion>
                </div>
            </div>
            {orderData?.data?.status !== "canceled" && (
                <div className="flex w-full flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        disabled={
                            orderData?.data?.status !== "draft" &&
                            orderData.data?.status !== "pending"
                        }
                        onClick={() => cancelOrderMutation.mutate({ orderId })}
                        className="mt-auto w-full rounded-lg border border-slate-200 p-2 text-center font-bold uppercase shadow hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white disabled:opacity-30 sm:m-0 sm:w-auto sm:min-w-[120px]"
                    >
                        {cancelOrderMutation.isLoading ? <LoadingSpinner size={24} /> : "CANCEL"}
                    </button>
                    <button
                        onClick={() => invoiceMutation.mutate({ orderId })}
                        className="mt-auto w-full rounded-lg border border-slate-200 p-2 text-center font-bold uppercase shadow hover:bg-slate-200 hover:text-black focus:bg-slate-200 focus:text-black disabled:opacity-30 sm:m-0 sm:w-auto sm:min-w-[120px]"
                    >
                        {invoiceMutation.isLoading ? (
                            <LoadingSpinner size={24} />
                        ) : invoiceMutation.isSuccess ? (
                            "Invoice resent :)"
                        ) : (
                            "Resend Invoice"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

OrderPage.auth = true;

export default OrderPage;
