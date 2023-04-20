import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "../utils/axiosClients";
import Stripe from "stripe";
import { TOrder } from "../pages/api/stripe/webhooks";

interface IDeleteOrder {
    orderId: string | string[] | undefined;
}

export const useCancelOrderMutation = () => {
    const queryClient = useQueryClient();

    const deleteOrder = async ({ orderId }: IDeleteOrder) => {
        await apiInstance.delete<Stripe.Response<Stripe.Refund>>("/api/printful/cancel_order", {
            params: { orderId },
        });

        await queryClient.refetchQueries({
            queryKey: ["order", orderId],
        });
    };

    return useMutation(deleteOrder, {
        onMutate: async ({ orderId }) => {
            await queryClient.cancelQueries(["order", orderId]);
            const previousOrder = queryClient.getQueryData(["order", orderId]);
            queryClient.setQueryData(["order", orderId], (old) => {
                return { ...old!, status: "canceled" };
            });

            // queryClient.setQueryData(["orders"], (old) => {

            // })

            return { previousOrder };
        },
        onError: (_err, data, context) => {
            queryClient.setQueryData(["order", data.orderId], context?.previousOrder);
        },
    });
};
