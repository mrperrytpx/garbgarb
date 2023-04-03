import Image from "next/image";
import { TCartProduct } from "../redux/slices/cartSlice";
import { currency } from "../utils/currency";

interface IMinimalCartProduct {
  item: TCartProduct;
}

export const MinimalCartProduct = ({ item }: IMinimalCartProduct) => {
  return (
    <article className="flex w-full flex-col items-center justify-center gap-4 border-b-2 p-2 last:border-0 sm:flex-row">
      <div className="hidden sm:block">
        <Image src={item.variant_image} width={25} height={25} alt={item.name} />
      </div>
      <div className="flex w-full items-center justify-between gap-2 sm:flex-[2] sm:justify-start">
        <div>{item.name}</div>
        <strong>x{item.quantity}</strong>
      </div>
      <div className="flex w-full items-center justify-between gap-2 sm:flex-1 sm:gap-16 md:justify-end">
        <div>{currency(item.price)}</div>
        <strong>{currency(+item.price * item.quantity)}</strong>
      </div>
    </article>
  );
};
