import Image from "next/image";
import { TCartProduct } from "../redux/slices/cartSlice";
import { currency } from "../utils/currency";

interface IMinimalCartProduct {
  item: TCartProduct;
}

export const MinimalCartProduct = ({ item }: IMinimalCartProduct) => {
  return (
    <article className="flex w-full flex-col items-center justify-center gap-4 border-b-2 p-2 last:border-0 sm:flex-row">
      <div className="hidden max-h-[36px] max-w-[36px] sm:block">
        <Image
          className="h-full w-full"
          src={item.variant_image}
          width={100}
          height={100}
          alt={item.name}
        />
      </div>
      <div className="flex w-full items-center justify-between gap-2 sm:flex-[2] sm:justify-start">
        <div>
          <p>{item.name}</p>
          <p className="text-xs">
            ({item.color_name} - {item.size})
          </p>
        </div>
        <strong className="self-start">x{item.quantity}</strong>
      </div>
      <div className="flex w-full items-center justify-between gap-2 sm:flex-1 sm:justify-end sm:gap-16 sm:self-start">
        <div>{currency(item.price)}</div>
        <strong>{currency(+item.price * item.quantity)}</strong>
      </div>
    </article>
  );
};
