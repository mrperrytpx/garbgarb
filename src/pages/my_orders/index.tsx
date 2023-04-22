import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { apiInstance } from "../../utils/axiosClients";
import { Order } from "@prisma/client";
import Link from "next/link";
import { currency } from "../../utils/currency";
import { LinkButton } from "../../components/LinkButton";
import { useRouter } from "next/router";
import { useState } from "react";
import { Portal } from "../../components/Portal";
import { AllOrdersSkeleton } from "../../components/skeletons/AllOrdersSkeleton";

const ProfilePage = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const allOrders = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await apiInstance.get<Order[]>("/api/printful/get_all_orders");
            const data = res.data;
            return data;
        },
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const deleteUserMutation = useMutation(
        async () => {
            await apiInstance.delete("/api/auth/delete_user");
        },
        {
            onSuccess: () => {
                router.reload();
            },
        }
    );

    const deleteCanceledOrder = useMutation(
        async ({ orderId }: { orderId: string | number }) => {
            await apiInstance.delete("/api/delete_canceled_order", {
                params: {
                    orderId,
                },
            });
        },
        {
            onSettled: () => {
                queryClient.invalidateQueries(["orders"]);
            },
            onMutate: async ({ orderId }) => {
                await queryClient.cancelQueries(["order", orderId]);
                await queryClient.cancelQueries(["orders"]);
                const previousOrders = queryClient.getQueryData(["orders"]);

                queryClient.setQueryData<Order[]>(["orders"], (old) => {
                    return old?.filter((x) => x.id !== orderId);
                });

                return { previousOrders };
            },
            onError: (_err, _data, context) => {
                queryClient.setQueryData(["orders"], context?.previousOrders);
            },
        }
    );

    return (
        <div className="mx-auto my-2 flex w-full max-w-screen-sm flex-1 flex-col gap-4 p-2 text-white">
            <div className="w-full">
                <h1 className="font-semibold uppercase">Orders:</h1>
                <div className="mt-2 flex">
                    {allOrders.isLoading ? (
                        <div className="flex h-40 w-full flex-col items-center justify-center gap-2 p-2 text-white">
                            <p className="text-sm font-semibold">Loading orders...</p>
                            <LoadingSpinner size={50} />
                        </div>
                    ) : allOrders.data?.length ? (
                        <>
                            {allOrders.data?.map((order, i) => (
                                <div className="flex w-full flex-col items-start gap-2" key={i}>
                                    <Link
                                        href={`/my_orders/${order.id}`}
                                        key={i}
                                        className="w-full rounded-md border border-gray-500 p-2"
                                    >
                                        <div className="flex flex-col justify-between gap-2">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="underline">#{order.id}</span>
                                                <strong
                                                    style={{
                                                        textDecoration: order.canceled
                                                            ? "line-through"
                                                            : "",
                                                    }}
                                                    className="min-w-[70px] text-right"
                                                >
                                                    {currency(order.totalAmount / 100)}
                                                </strong>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-sm">
                                                    {new Intl.DateTimeFormat("en-GB", {
                                                        weekday: "short",
                                                        year: "2-digit",
                                                        month: "short",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                    }).format(new Date(order.createdAt))}
                                                </span>
                                                {order.canceled && (
                                                    <strong className="uppercase text-red-600">
                                                        Canceled
                                                    </strong>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    {order.canceled && (
                                        <button
                                            onClick={() =>
                                                deleteCanceledOrder.mutate({ orderId: order.id })
                                            }
                                            className="group relative z-10 w-24 rounded-md border border-gray-500 p-2 shadow-sm shadow-gray-500 hover:border-slate-200 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                                        >
                                            DELETE
                                            <div className="pointer-events-none absolute left-full top-[6px] z-0 h-8 w-8 -translate-y-1/2 rounded-br-lg border-b-2 border-r-2 border-gray-500  group-hover:border-red-500"></div>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="flex w-full flex-col items-center justify-start gap-4">
                            <h2 className="mt-8 p-4 text-center">You haven't placed any orders</h2>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex w-full flex-col gap-4">
                <h1 className="font-semibold uppercase">Account:</h1>

                <button
                    className="rounded-lg border p-2 shadow-sm shadow-slate-200 transition-colors hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                    onClick={() => setIsModalOpen(!isModalOpen)}
                >
                    {deleteUserMutation.isLoading ? <LoadingSpinner size={20} /> : "Delete Account"}
                </button>
            </div>
            {isModalOpen && (
                <Portal>
                    <div className="relative flex max-h-full w-full max-w-[min(95%,450px)] flex-col items-center gap-8 overflow-y-auto rounded-md border-2 bg-black p-4 text-center text-sm text-white">
                        <div>
                            <h1 className="mb-2 text-xl font-bold uppercase">Are you sure?</h1>
                            <p className="mb-2 text-sm">All of your data will be deleted.</p>
                            <p className="text-sm">
                                This will <strong className="text-red-600">NOT</strong> cancel any
                                of your outgoing orders!
                            </p>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <button
                                onClick={() => {
                                    deleteUserMutation.mutate();
                                    setIsModalOpen(false);
                                }}
                                className="min-w-[100px] rounded-lg border p-2 font-semibold shadow-md hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                            >
                                I'M SURE
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="min-w-[100px] rounded-lg border p-2 font-semibold shadow-sm shadow-slate-100 hover:bg-slate-200 hover:text-black focus:bg-slate-200 focus:text-black"
                            >
                                NO
                            </button>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};

export default ProfilePage;

ProfilePage.auth = true;
