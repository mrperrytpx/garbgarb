import Image from "next/image";
import { TCartProduct, removeFromCart } from "../redux/slices/cartSlice";
import { currency } from "../utils/currency";
import { TOrderItem } from "../pages/api/stripe/webhooks";
import { RxCross1 } from "react-icons/rx";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

interface IMinimalCartProduct {
    item: TCartProduct | TOrderItem;
}

function isCartProduct(item: TCartProduct | TOrderItem): item is TCartProduct {
    return (item as TCartProduct).store_product_variant_id !== undefined;
}

export const MinimalCartProduct = ({ item }: IMinimalCartProduct) => {
    const dispatch = useDispatch();

    if (isCartProduct(item)) {
        return (
            <article
                key={item.store_product_variant_id}
                className={`flex w-full items-center gap-2 rounded-md border-b-2 border-gray-600 bg-black px-2 py-2 text-sm text-gray-200 shadow-sm sm:flex-row ${
                    item.outOfStock && "shadow-sm shadow-red-400"
                }`}
            >
                <div className="max-w-[50px] rounded-lg bg-slate-200 sm:block">
                    <Image src={item.variant_image} width={100} height={100} alt="Item" />
                </div>
                <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                        <p>
                            <span className={`${item.outOfStock && "line-through"}`}>
                                {item.name}
                            </span>
                            {item.outOfStock ? (
                                <strong className="text-sm"> - OOS</strong>
                            ) : (
                                <strong>{" - x" + item.quantity}</strong>
                            )}
                        </p>
                        {item.outOfStock ? (
                            <button
                                onClick={() => {
                                    dispatch(removeFromCart({ sku: item.sku }));
                                    toast.success("Removed from cart.");
                                }}
                                className="mb-2 rounded-lg p-1 shadow"
                            >
                                <RxCross1 size="14" />
                            </button>
                        ) : (
                            <p className="hidden xs:inline">{currency(item.price)}</p>
                        )}
                    </div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                        <p className={`text-xs ${item.outOfStock && "line-through"}`}>
                            ({item.color_name} - {item.size})
                        </p>
                        <p className={`${item.outOfStock && "line-through"}`}>
                            <strong>{currency(+item.price * item.quantity)}</strong>
                        </p>
                    </div>
                </div>
            </article>
        );
    }
    return (
        <div
            key={item.id}
            className="flex items-center gap-2 rounded-lg bg-black px-2 py-2 text-sm text-gray-200 sm:flex-row"
        >
            <div className="w-[50px] max-w-[50px] sm:block">
                <Image
                    className="rounded-lg bg-slate-200"
                    src={item.files[1].thumbnail_url}
                    width={100}
                    height={100}
                    alt="Item"
                />
            </div>
            <div className="flex w-full flex-col gap-0.5">
                <p key={item.id}>{item.name}</p>
                <div className="mb-1 flex justify-between gap-4">
                    <p>
                        <strong>x{item.quantity}</strong>
                    </p>
                    <p className="min-w-[50px]">
                        <strong>{currency(+item.retail_price * item.quantity)}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};
