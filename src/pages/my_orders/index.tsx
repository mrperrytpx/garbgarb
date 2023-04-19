import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { apiInstance } from "../../utils/axiosClients";
import { Order } from "@prisma/client";
import Link from "next/link";
import { currency } from "../../utils/currency";
import { LinkButton } from "../../components/LinkButton";
import { useRouter } from "next/router";

const ProfilePage = () => {
    const router = useRouter();

    const allOrders = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await apiInstance.get<Order[]>("/api/printful/get_all_orders");
            const data = res.data;
            return data;
        },
    });

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

    if (allOrders.isLoading)
        return (
            <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-2">
                <p>Getting all orders...</p>
                <LoadingSpinner size={50} />
            </div>
        );

    return (
        <div className="mx-auto my-2 flex w-full max-w-screen-sm flex-1 flex-col gap-4 p-2">
            <div className="w-full">
                <h1 className="w-full border-b-2 font-bold uppercase">Orders:</h1>
                <div className="mt-2 flex">
                    {allOrders.data?.length ? (
                        <div className="flex w-full flex-1 flex-col gap-2 sm:items-start">
                            {allOrders.data?.map((x, i) => (
                                <Link
                                    style={{
                                        border: x.canceled ? "1px solid #ef4444A3" : "",
                                    }}
                                    key={i}
                                    className="w-full rounded-md p-4 shadow-md "
                                    href={`/my_orders/${x.id}`}
                                >
                                    <div className="flex flex-col justify-between gap-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="underline">#{x.id}</span>
                                            <strong className="min-w-[70px] text-right">
                                                {currency(x.totalAmount / 100)}
                                            </strong>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span>
                                                {new Intl.DateTimeFormat("en-GB", {
                                                    weekday: "short",
                                                    year: "2-digit",
                                                    month: "short",
                                                    day: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                }).format(new Date(x.createdAt))}
                                            </span>
                                            {x.canceled && (
                                                <strong className="uppercase">Canceled</strong>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {/* <LinkButton href="/checkout">Place an order</LinkButton> */}
                        </div>
                    ) : (
                        <div className="flex w-full flex-col items-center justify-start gap-4">
                            <h2 className="mt-8 p-4 text-center">You haven't placed any orders</h2>
                            <LinkButton href="/checkout">Place one now</LinkButton>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex w-full flex-col gap-4">
                <h1 className="w-full border-b-2 font-bold uppercase">Account:</h1>

                <button
                    className="rounded-lg border p-2 shadow transition-colors hover:bg-slate-500 hover:text-white"
                    onClick={() => deleteUserMutation.mutate()}
                >
                    {deleteUserMutation.isLoading ? <LoadingSpinner size={20} /> : "Delete Account"}
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;

ProfilePage.auth = true;
