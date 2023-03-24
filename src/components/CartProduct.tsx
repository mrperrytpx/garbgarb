import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  TCartProduct,
} from "../redux/slices/cartSlice";
import { currency } from "../utils/currency";

export const CartProduct = ({ product }: { product: TCartProduct }) => {
  const dispatch = useDispatch();

  return (
    <article className="relative flex w-full flex-col items-center justify-center gap-1 border-b-2 last-of-type:border-0 sm:flex-row">
      <Link
        className="select-nonerounded-md min-w-[100px] max-w-[150px] border"
        href={`/products/${product.sync_id}`}
      >
        <Image width={150} height={150} src={product.variant_image} alt="Product" />
      </Link>
      {/*  */}
      <div className="flex w-full flex-col sm:gap-4">
        <div className="flex flex-1 flex-col p-2 text-center text-sm  sm:text-left">
          <Link
            href={`/products/${product.sync_id}`}
            className="hover:underline focus:underline sm:text-base"
          >
            {product.name}
          </Link>
          <p>
            Size: <span className="font-bold">{product.size}</span>
          </p>
          <p>
            Color: <span className="font-bold">{product.color_name}</span>
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center gap-4 p-2 text-sm sm:w-full sm:justify-start sm:gap-8 sm:text-base">
          <p>{currency(product.price)}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => dispatch(decreaseQuantity({ sku: product.sku }))}
              className="select-none border px-2"
            >
              -
            </button>
            <p>{product.quantity}</p>
            <button
              onClick={() => dispatch(increaseQuantity({ sku: product.sku }))}
              className="select-none border px-2"
            >
              +
            </button>
          </div>
          <p>{currency(+product.price * product.quantity)}</p>
          <button
            className="absolute top-0 right-0 select-none bg-black px-1 text-white"
            onClick={() => dispatch(removeFromCart({ sku: product.sku }))}
            type="button"
          >
            X
          </button>
        </div>
      </div>
    </article>
  );
};
