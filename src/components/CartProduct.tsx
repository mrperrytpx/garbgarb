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
import { FiX } from "react-icons/fi";

export const CartProduct = ({ product }: { product: TCartProduct }) => {
    const dispatch = useDispatch();

    return (
        <article
            style={{
                borderTop: product.outOfStock ? "2px solid red" : "",
            }}
            className="relative flex w-full flex-row items-center justify-center gap-4 rounded-lg border-b-2 border-gray-600 bg-black p-2 text-sm"
        >
            <Link
                className="min-w-[75px] max-w-[75px] select-none rounded-lg bg-slate-200 hover:scale-105"
                href={`/products/${product.store_product_id}`}
            >
                <Image width={200} height={200} src={product.variant_image} alt="Product" />
            </Link>
            {/*  */}
            <div className="flex w-full flex-col gap-4 ">
                <div className="flex flex-1 flex-col items-start justify-center gap-1 ">
                    <Link
                        href={`/products/${product.store_product_id}`}
                        className="mr-8 text-base font-semibold hover:animate-hop hover:underline focus:animate-hop focus:underline"
                    >
                        {product.name}
                    </Link>
                    <div
                        tabIndex={0}
                        className="group absolute right-1 top-1 cursor-pointer select-none rounded-full bg-zinc-950 outline outline-2 outline-gray-600 hover:animate-hop hover:bg-white focus:animate-hop focus:bg-white"
                    >
                        <FiX
                            onClick={() => {
                                dispatch(removeFromCart({ sku: product.sku }));
                            }}
                            size="28"
                            stroke="white"
                            className="p-1 group-hover:stroke-black group-focus:stroke-black"
                        />
                    </div>
                    <p>
                        ({product.color_name} - {product.size})
                    </p>
                </div>
                <div className="flex flex-1 items-center gap-4 ">
                    <p>{currency(product.price)}</p>
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => dispatch(decreaseQuantity({ sku: product.sku }))}
                            className="select-none rounded-md px-2 text-sm outline outline-2 outline-gray-600 hover:bg-slate-200 hover:text-black focus:outline-white"
                        >
                            -
                        </button>
                        <p className="w-4 text-center">{product.quantity}</p>
                        <button
                            onClick={() => dispatch(increaseQuantity({ sku: product.sku }))}
                            className="select-none rounded-md px-2 text-sm outline outline-2 outline-gray-600 hover:bg-slate-200 hover:text-black focus:outline-white"
                        >
                            +
                        </button>
                    </div>
                    <strong>{currency(+product.price * product.quantity)}</strong>
                </div>
            </div>
            {/*  */}
        </article>
    );
};
