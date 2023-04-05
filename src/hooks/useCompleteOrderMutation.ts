import { useSelector } from "react-redux";
import { TCheckoutPayload } from "../lib/checkPayload";
import { cartSelector } from "../redux/slices/cartSlice";
import { apiInstance } from "../utils/axiosClients";
import Stripe from "stripe";
import { getStripe } from "../utils/getStripe";
import { useMutation } from "@tanstack/react-query";

interface IPostCompleteOrder {
    address: {
        city: string;
        country: string;
        province: string;
        zip: string;
        streetName: string;
        streetNumber: string;
        subpremise?: string | undefined;
    };
}

export const useCompleteOrderMutation = () => {
    const productsInCart = useSelector(cartSelector);

    const postCompleteOrder = async ({ address }: IPostCompleteOrder) => {
        const checkoutPayload: TCheckoutPayload = productsInCart.map((item) => ({
            store_product_id: item.store_product_id,
            store_product_variant_id: item.store_product_variant_id,
            quantity: item.quantity,
        }));

        const checkoutResponse = await apiInstance.post("/api/stripe/checkout_session", {
            cartItems: checkoutPayload,
            address,
        });

        const checkoutSession: Stripe.Checkout.Session = checkoutResponse.data;

        if ((checkoutSession as any).statusCode === 500) {
            console.error((checkoutSession as any).message);
            return;
        }

        const stripe = await getStripe();
        const { error } = await stripe!.redirectToCheckout({
            sessionId: checkoutSession.id,
        });

        console.warn(error.message);
    };

    return useMutation(postCompleteOrder);
};
