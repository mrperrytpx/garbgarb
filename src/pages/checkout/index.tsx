import React from "react";
import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { useRouter } from "next/router";
import { CartProduct } from "../../components/CartProduct";
import Stripe from "stripe";
import getStripe from "../../utils/getStripe";
import { axiosClient } from "../../utils/axiosClient";

export type TCheckoutPayload = {
  store_product_id: number;
  store_product_variant_id: number;
  sku: string;
  quantity: number;
};

const CheckoutPage = () => {
  const productsInCart = useSelector(cartSelector);
  const router = useRouter();

  if (!productsInCart.length) {
    router.push("/products");
    return <div className="flex-1">Redirecting to shop</div>;
  }

  async function handleCompleteOrder() {
    const checkoutPayload: Array<TCheckoutPayload> = productsInCart.map((item) => ({
      store_product_id: item.store_product_id,
      store_product_variant_id: item.store_product_variant_id,
      sku: item.sku,
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

  return (
    <div className="m-auto flex w-full max-w-screen-md flex-1 flex-col items-center justify-start gap-2">
      <div className="w-full rounded-md border-2 p-6">Cart Overview</div>
      <div className="flex w-full flex-col items-center gap-4">
        {JSON.stringify(productsInCart, null, 2)}
        {productsInCart.map((product) => (
          <CartProduct key={product.sku} product={product} />
        ))}
      </div>
      <div className="w-full rounded-md border-2 p-6">Shipping Cost & VAT</div>
      <div className="w-full rounded-md border-2 p-6">Order Overview</div>
      <button type="button" onClick={handleCompleteOrder} className="border-md self-end border p-4">
        Submit & Pay
      </button>
    </div>
  );
};

export default CheckoutPage;
