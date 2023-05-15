import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "../utils/axiosClients";
import Stripe from "stripe";
import { toast } from "react-toastify";

interface IDeleteOrder {
    orderId: string | string[] | undefined;
}

export const useCancelOrderMutation = () => {
    const queryClient = useQueryClient();
    const deleteOrder = async ({ orderId }: IDeleteOrder) => {
        await apiInstance.delete<Stripe.Response<Stripe.Refund>>("/api/printful/cancel_order", {
            params: { orderId },
        });

        return orderId;
    };

    return useMutation(
        deleteOrder,
        //     {
        //     onMutate: async ({ orderId }) => {
        //         await queryClient.cancelQueries(["order", orderId]);
        //         await queryClient.cancelQueries(["orders"]);
        //         const previousOrder = queryClient.getQueryData(["order", orderId]);
        //         queryClient.setQueryData(["order", orderId], (old) => {
        //             return { ...old!, status: "canceled" };
        //         });

        //         const previousOrders = queryClient.getQueryData(["orders"]);

        //         queryClient.setQueryData<Order[]>(["orders"], (old) => {
        //             return old?.map((x) => ({ ...x, canceled: true }));
        //         });

        //         return { previousOrder, previousOrders };
        //     },
        //     onError: (_err, data, context) => {
        //         queryClient.setQueryData(["order", data.orderId], context?.previousOrder);
        //         queryClient.setQueryData(["orders"], context?.previousOrders);
        //     },
        //     onSettled: (data) => {
        //         setTimeout(() => queryClient.invalidateQueries({ queryKey: ["order", data] }), 500);
        //     },
        {
            onSuccess: () => {
                toast.info("Order canceled.");
            },
            onSettled: (data) => {
                setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ["order", data] });
                    queryClient.invalidateQueries({ queryKey: ["orders"] });
                }, 1250);
            },
        }
    );
};
