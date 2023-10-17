// ./utils/get-stripejs.ts
import { Stripe, loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;
export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(
            `${
                process.env.NODE_ENV === "development"
                    ? process.env.NEXT_PUBLIC_DEV_STRIPE_PUBLIC_KEY
                    : process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!
            }`
        );
    }
    return stripePromise;
};
