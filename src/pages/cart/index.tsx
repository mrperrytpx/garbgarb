import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { CartProduct } from "../../components/CartProduct";
import { currency } from "../../utils/currency";
import Link from "next/link";

const CartPage = () => {
  const productsInCart = useSelector(cartSelector);

  if (!productsInCart.length)
    return (
      <div className="my-auto flex flex-1 flex-col items-center justify-center gap-8 sm:m-auto">
        <p className="self-center">Your cart is empty!</p>
        <p className="self-center text-2xl">(⌣̩̩́_⌣̩̩̀)</p>
        <Link className="max-w-[200px] border p-4 text-center uppercase" href="/products">
          Start shopping!
        </Link>
      </div>
    );

  return (
    <div className="mx-auto flex w-full max-w-screen-lg flex-col gap-4 p-2 sm:flex-row sm:items-start ">
      <div className="flex w-full flex-col items-center gap-2 ">
        {productsInCart.map((product) => (
          <CartProduct key={product.sku} product={product} />
        ))}
      </div>
      {/*  */}
      <div className="mt-auto flex flex-col justify-center gap-2 border-t-2 sm:m-0 sm:justify-start sm:rounded-md sm:border sm:border-slate-300 sm:px-4 sm:py-6 sm:shadow-md">
        <div className="flex w-full flex-col items-center justify-center gap-0.5 py-3 sm:rounded-md">
          <div className="flex items-center justify-start gap-2">
            <p>Subtotal:</p>
            <p className="text-lg font-bold">
              {currency(
                productsInCart.reduce((prev, curr) => prev + +curr.price * curr.quantity, 0)
              )}
            </p>
          </div>
          <p className="text-xs sm:self-start">Fees not applied</p>
        </div>
        <Link
          href="/checkout"
          className="w-full self-center rounded-md border-2 p-2 text-center transition-all hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white sm:w-36"
        >
          CHECKOUT
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
