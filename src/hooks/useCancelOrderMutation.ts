import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "../utils/axiosClients";
import Stripe from "stripe";

interface IDeleteOrder {
    orderId: string | string[] | undefined;
}

export const useCancelOrderMutation = () => {
    const queryClient = useQueryClient();

    const deleteOrder = async ({ orderId }: IDeleteOrder) => {
        await apiInstance.delete<Stripe.Response<Stripe.Refund>>("/api/printful/cancel_order", {
            params: { orderId },
        });

        setTimeout(
            async () =>
                await queryClient.refetchQueries({
                    queryKey: ["order", orderId],
                }),
            1000
        );
    };

    return useMutation(deleteOrder);
};
