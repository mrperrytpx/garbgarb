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
    <article className="flex gap-2">
      <Link href={`/products/${product.sync_id}`}>
        <div className="max-w-[150px] rounded-md border">
          <Image width={150} height={150} src={product.variant_image} alt="Product" />
        </div>
      </Link>
      {/*  */}
      <div className="flex w-full flex-col">
        <div className="flex flex-1 flex-col p-2">
          <p>{product.name}</p>
          <p>
            Size: <span className="font-bold">{product.size}</span>
          </p>
        </div>

        <div className="flex w-full flex-1 items-end justify-between p-2">
          <p>{currency(product.price)}</p>
          <div className="flex gap-4">
            <button
              onClick={() => dispatch(decreaseQuantity({ sku: product.sku }))}
              className="border px-2"
            >
              -
            </button>
            <p>{product.quantity}</p>
            <button
              onClick={() => dispatch(increaseQuantity({ sku: product.sku }))}
              className="border px-2"
            >
              +
            </button>
          </div>
          <p>{currency(+product.price * product.quantity)}</p>
          <button
            className="justify-self-end"
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
