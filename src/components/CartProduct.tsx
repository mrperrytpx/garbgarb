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
            className="relative flex w-full flex-col items-center justify-center gap-4 rounded-lg p-2 shadow shadow-slate-100 sm:flex-row"
        >
            <Link
                className="select-nonerounded-md min-w-[100px] max-w-[150px]"
                href={`/products/${product.store_product_id}`}
            >
                <div className="max-w-[150px] rounded-lg bg-slate-200">
                    <Image width={200} height={200} src={product.variant_image} alt="Product" />
                </div>
            </Link>
            {/*  */}
            <div className="flex w-full flex-col gap-4 sm:gap-4">
                <div className="flex flex-1 flex-col items-center justify-center gap-1 text-sm sm:items-start sm:text-left">
                    <Link
                        href={`/products/${product.store_product_id}`}
                        className="font-semibold hover:underline focus:underline sm:mr-8 sm:text-base"
                    >
                        {product.name}
                    </Link>
                    <div className="flex gap-4">
                        <p>
                            Size: <span className="font-bold">{product.size}</span>
                        </p>
                        <p>
                            Color: <span className="font-bold">{product.color_name}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-evenly gap-4 text-sm sm:w-full sm:justify-start sm:gap-8 sm:text-base">
                    <p>{currency(product.price)}</p>
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => dispatch(decreaseQuantity({ sku: product.sku }))}
                            className="select-none rounded-sm border px-2"
                        >
                            -
                        </button>
                        <p>{product.quantity}</p>
                        <button
                            onClick={() => dispatch(increaseQuantity({ sku: product.sku }))}
                            className="select-none rounded-sm border px-2"
                        >
                            +
                        </button>
                    </div>
                    <strong>{currency(+product.price * product.quantity)}</strong>
                    {/*  */}
                    <div className="absolute top-1 right-1 cursor-pointer select-none rounded-full shadow shadow-slate-100 outline-slate-400 hover:bg-white ">
                        <FiX
                            onClick={() => dispatch(removeFromCart({ sku: product.sku }))}
                            size="28"
                            stroke="white"
                            className="p-1 hover:stroke-black"
                        />
                    </div>
                </div>
            </div>
        </article>
    );
};
