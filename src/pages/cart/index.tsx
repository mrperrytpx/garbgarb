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
    <div className="m-auto mt-2 flex w-full max-w-[900px] flex-1 flex-col gap-4 p-2 sm:mt-4">
      <div className="flex w-full flex-col items-center gap-4">
        {productsInCart.map((product) => (
          <CartProduct key={product.sku} product={product} />
        ))}
      </div>
      {/*  */}
      <div className="mt-auto flex flex-col items-end justify-center border-t-2 sm:m-0">
        <div className="flex flex-col justify-center gap-1 py-4 text-center">
          <p className="block w-full sm:text-right">
            TOTAL:{" "}
            <span className="text-2xl font-bold underline">
              {currency(
                productsInCart.reduce((prev, curr) => prev + +curr.price * curr.quantity, 0)
              )}
            </span>
          </p>
          <p className="text-right text-xs">VAT not included</p>
        </div>
        <Link
          href="/checkout"
          className="w-full border-2 p-4 text-center hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white sm:w-36 sm:self-end"
        >
          CHECKOUT
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
