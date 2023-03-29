import React from "react";
import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { useRouter } from "next/router";
import { CartProduct } from "../../components/CartProduct";
import Stripe from "stripe";
import { getStripe } from "../../utils/getStripe";
import { axiosClient } from "../../utils/axiosClient";
import { TCheckoutPayload } from "../api/stripe/checkout_session";
import { useForm } from "react-hook-form";
import { allowedCountries } from "../../utils/allowedCountries";

export type TAddress = {
  address1: string;
  address2?: string;
  zip: string | number;
  city: string;
  country_code: string;
};

const CheckoutPage = () => {
  const productsInCart = useSelector(cartSelector);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function handleCompleteOrder() {
    const checkoutPayload: TCheckoutPayload = productsInCart.map((item) => ({
      store_product_id: item.store_product_id,
      store_product_variant_id: item.store_product_variant_id,
      quantity: item.quantity,
    }));

    const checkoutResponse = await axiosClient.post("/api/stripe/checkout_session", {
      cartItems: checkoutPayload,
      address: "test",
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
  }

  if (!productsInCart.length) {
    router.push("/products");
    return <div className="flex-1">Redirecting to shop</div>;
  }

  async function handleCheckShipping(e: React.SyntheticEvent) {
    e.preventDefault();

    const address = {
      address1: "Bellavista 4",
      zip: 50230,
      city: "Alhama De Aragón",
      country_code: "ES",
    };

    console.log("SENDING ADDRESS", address);

    const response = await axiosClient.post("/api/printful/shipping_rates", {
      cartItems: productsInCart,
      address,
    });

    const test = response.data;
    console.log("SHIPPING RATES", test);
  }

  return (
    <div className="m-auto flex w-full max-w-screen-md flex-1 flex-col items-center justify-start gap-2">
      {/* <div className="w-full rounded-md border-2 p-6">Cart Overview</div>
      <div className="flex w-full flex-col items-center gap-4">
        {productsInCart.map((product) => (
          <CartProduct key={product.sku} product={product} />
        ))}
      </div> */}
      <div className="w-full rounded-md border-2 p-6">Shipping Cost & VAT</div>
      <form onSubmit={handleCheckShipping} className="w-full">
        <div className="mb-4 w-full border-2 p-2 md:flex md:justify-between">
          <div className="mb-4 md:mr-2 md:mb-0">
            <label className="my-2 block text-sm font-bold text-gray-700" htmlFor="address1">
              Address Line 1
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight text-gray-700 focus:outline-none"
              id="address1"
              type="text"
              placeholder="Address Line 1"
            />
            <label className="my-2 block text-sm font-bold text-gray-700" htmlFor="address2">
              Address Line 2
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight text-gray-700 focus:outline-none"
              id="address2"
              type="text"
              placeholder="Address Line 2"
            />
            <label className="my-2 block text-sm font-bold text-gray-700" htmlFor="city">
              City
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight text-gray-700 focus:outline-none"
              id="city"
              type="text"
              placeholder="City"
            />
            <label className="my-2 block text-sm font-bold text-gray-700" htmlFor="zip">
              ZIP Code
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight text-gray-700 focus:outline-none"
              id="zip"
              type="text"
              placeholder="ZIP Code"
            />
            <label className="my-2 block text-sm font-bold text-gray-700" htmlFor="country">
              Country
            </label>
            <select defaultValue="HR" className="w-38 p-4" name="country" id="country">
              {allowedCountries.sort().map((country) => (
                <option value={country}>{country}</option>
              ))}
            </select>
          </div>
          <button className="border-md self-end border p-4" type="submit">
            Check shipping :)
          </button>
        </div>
      </form>
      <div className="w-full rounded-md border-2 p-6">Order Overview</div>
      <button type="button" onClick={handleCompleteOrder} className="border-md self-end border p-4">
        Submit & Pay
      </button>
    </div>
  );
};

export default CheckoutPage;
