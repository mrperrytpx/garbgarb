import Link from "next/link";
import Image from "next/image";
import Stripe from "stripe";
import { currency } from "../utils/currency";

interface IProductCard {
  product: Stripe.Product;
}

export const ProductCard = ({ product }: IProductCard) => {
  const splitName = product.name.split(" ");
  const whichIndex = splitName.indexOf("Unisex");

  const shirtName = splitName.slice(0, whichIndex).join(" ");
  const defualtShirtName = splitName.slice(whichIndex).join(" ");

  const parsedSizes: string[] = JSON.parse(product.metadata.sizes);
  const parsedColors: string[] = JSON.parse(product.metadata.colors);

  return (
    <div className="max-w-[300px] rounded-md border-2 border-b-8 md:self-start">
      <Link href={`/products/${product.metadata.id}`}>
        <Image
          className="border border-b-2"
          src={product.metadata.thumbnail_url}
          alt=""
          width={400}
          height={400}
        />
        <div className="p-2">
          <p className="text-center text-lg md:text-xl">{shirtName}</p>
          <p className="text-center md:text-lg">{defualtShirtName}</p>
          <p className="text-center text-sm md:text-base">
            from <span className="underline">{currency(product.metadata.starting_price)}</span>
          </p>
          <div className="flex w-full justify-center gap-1">
            Sizes:{" "}
            {parsedSizes.map((size, i) => (
              <span key={i}>
                {size}
                {i !== parsedSizes.length - 1 && ","}
              </span>
            ))}
          </div>
          <div className="flex w-full justify-center gap-1">
            Sizes:{" "}
            {parsedColors.map((color, i) => (
              <span key={i} className="capitalize">
                {color}
                {i !== parsedColors.length - 1 && ","}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};
