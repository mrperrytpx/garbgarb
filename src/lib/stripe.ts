import Stripe from "stripe";

export const stripe = new Stripe(
    process.env.PROD_FLAG === "development"
        ? process.env.DEV_STRIPE_PRIVATE_KEY!
        : process.env.STRIPE_PRIVATE_KEY!,
    {
        apiVersion: "2022-11-15",
    }
);
