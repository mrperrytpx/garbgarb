import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { getStripe } from "../../utils/getStripe";
import { apiInstance } from "../../utils/axiosClients";
import { TCheckoutPayload } from "../api/stripe/checkout_session";
import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js/types/stripe-js";
import CheckoutForm from "../../components/CheckoutForm";

export type TAddress = {
  address1: string;
  address2?: string;
  zip: string | number;
  city: string;
  country_code: string;
};
const stripePromise = getStripe();

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState("");
  const productsInCart = useSelector(cartSelector);

  useEffect(() => {
    (async () => {
      const checkoutPayload: TCheckoutPayload = productsInCart.map((item) => ({
        store_product_id: item.store_product_id,
        store_product_variant_id: item.store_product_variant_id,
        quantity: item.quantity,
      }));

      const response = await apiInstance.post<{ clientSecret: string }>(
        "/api/stripe/create_payment_intent",
        {
          cartItems: checkoutPayload,
        }
      );

      console.log(response);

      const cliSec = response?.data?.clientSecret;
      setClientSecret(cliSec);
    })();
  }, []);

  const options: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "flat",
        },
        loader: "auto",
      }
    : undefined;

  return (
    <div className="m-auto flex w-full max-w-screen-md flex-1 flex-col items-center justify-start gap-2">
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default CheckoutPage;
