import React from "react";
import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { useRouter } from "next/router";

const CheckoutPage = () => {
  const productsInCart = useSelector(cartSelector);
  const router = useRouter();

  if (!productsInCart.length) {
    router.push("/products");
    return <div className="flex-1">Redirecting to shop</div>;
  }

  return (
    <div className="m-auto flex w-full max-w-screen-md flex-1 flex-col items-center justify-start gap-2">
      <div className="w-full rounded-md border-2 p-6">Cart Overview</div>
      <div className="w-full rounded-md border-2 p-6">Shipping Cost & VAT</div>
      <div className="w-full rounded-md border-2 p-6">Order Overview</div>
      <button className="border-md self-end border p-4">Submit & Pay</button>
    </div>
  );
};

export default CheckoutPage;
