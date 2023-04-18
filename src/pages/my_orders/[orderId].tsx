import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { apiInstance } from "../../utils/axiosClients";
import { TOrderResponse } from "../api/stripe/webhooks";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { currency } from "../../utils/currency";
import { Accordion } from "../../components/Accordion";
import { IoArrowBackSharp } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import { useCancelOrderMutation } from "../../hooks/useCancelOrderMutation";
import Stripe from "stripe";

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
            console.log(data);
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

    if (orderData.isLoading)
        return (
            <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-2">
                <p className="text-sm">Loading order {orderId}..</p>
                <LoadingSpinner size={50} />
            </div>
        );

    const shippingAddress = `${orderData.data?.recipient.address1}${
        orderData.data?.recipient.address2 ? " " + orderData.data?.recipient.address2 : ""
    }, ${orderData.data?.recipient.city}, ${orderData.data?.recipient.zip}-${
        orderData.data?.recipient.country_code
    }`;

    if (!orderData.data) return <div>yikes lmao</div>;

    return (
        <div className="mx-auto mt-4 mb-2 flex w-full max-w-screen-sm flex-1 flex-col gap-2">
            <div className="flex items-center justify-between px-2 ">
                <Link className="rounded-lg p-2 shadow" href="/my_orders">
                    <IoArrowBackSharp size="28" />
                </Link>
                <h1 className="text-xl font-bold underline">#{orderId}</h1>
            </div>
            <div className="mb-10 mt-4 flex flex-col gap-4 px-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm uppercase">Order Status:</strong>
                    <strong className="text-sm uppercase">{orderData.data?.status}</strong>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
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
                        }).format(orderData.data?.created * 1000)}
                    </p>
                </div>
                <div
                    style={{
                        opacity: orderData.data.status === "canceled" ? "0.6" : "1",
                    }}
                    className="flex flex-col gap-2"
                >
                    <Accordion title="Customer Info:">
                        <div className="mb-2 flex flex-col gap-2 border-b-2 px-2 text-sm last-of-type:border-b-0">
                            <div className="flex flex-col flex-wrap">
                                <strong>Name:</strong>
                                <p className="">{orderData.data?.recipient.name}</p>
                            </div>
                            <div className="flex flex-col flex-wrap">
                                <strong>Email:</strong>
                                <p className="">{orderData.data?.recipient.email}</p>
                            </div>
                            <div className="flex flex-col flex-wrap">
                                <strong>Phone:</strong>
                                <p className="">{orderData.data?.recipient.phone}</p>
                            </div>
                            <div className="flex flex-col flex-wrap">
                                <strong>Address:</strong>
                                <p className="">{shippingAddress}</p>
                            </div>
                        </div>
                    </Accordion>
                    <Accordion title="Ordered items:">
                        {orderData.data?.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-2 border-b-2 px-2 text-sm last-of-type:border-b-0 sm:flex-row"
                            >
                                <div className="max-w-[50px] sm:block">
                                    <Image
                                        src={item.files[1].thumbnail_url!}
                                        width={100}
                                        height={100}
                                        alt="Item"
                                    />
                                </div>
                                <div className="flex w-full flex-col gap-0.5">
                                    <p key={item.id}>{item.name}</p>
                                    <div className="mb-1 flex justify-between gap-4">
                                        <p>
                                            <strong>x{item.quantity}</strong>
                                        </p>
                                        <p className="min-w-[50px]">
                                            <strong>
                                                {currency(+item.retail_price * item.quantity)}
                                            </strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Accordion>
                    <Accordion title="Shipping:">
                        <div className="mb-2 flex flex-col gap-2 border-b-2 px-2 text-sm last-of-type:border-b-0">
                            <div className="flex flex-col flex-wrap">
                                <strong>Shipping Type:</strong>
                                <p className="">{orderData.data?.shipping}</p>
                            </div>
                            <div className="flex flex-col flex-wrap">
                                <strong>Shipping Address:</strong>
                                <p className="">{shippingAddress}</p>
                            </div>
                            <div className="flex flex-col flex-wrap">
                                <strong>Shipping Name:</strong>
                                <p className="">{orderData.data.shipping_service_name}</p>
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
            {orderData.data.status !== "canceled" && (
                <div className="flex w-full flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        disabled={
                            orderData.data.status !== "draft" && orderData.data.status !== "pending"
                        }
                        onClick={() => cancelOrderMutation.mutate({ orderId })}
                        className="mt-auto w-full rounded-lg p-2 text-center font-bold uppercase shadow disabled:opacity-30 sm:m-0 sm:w-auto sm:min-w-[120px]"
                    >
                        {cancelOrderMutation.isLoading ? <LoadingSpinner size={24} /> : "CANCEL"}
                    </button>
                    <button
                        onClick={() => invoiceMutation.mutate({ orderId })}
                        className="mt-auto w-full rounded-lg p-2 text-center font-bold uppercase shadow disabled:opacity-30 sm:m-0 sm:w-auto sm:min-w-[120px]"
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
