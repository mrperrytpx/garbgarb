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
  const parsedColorHexs: string[] = JSON.parse(product.metadata.color_keys);

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
      </Link>
      <div className="p-2">
        <p className="text-center text-lg md:text-xl">{shirtName}</p>
        <p className="text-center md:text-lg">{defualtShirtName}</p>
        <p className="text-center text-sm md:text-base">
          from <span className="underline">{currency(product.metadata.starting_price)}</span>
        </p>
        <div className="flex w-full flex-wrap justify-center gap-1">
          Sizes:{" "}
          {parsedSizes.map((size, i) => (
            <span key={i}>
              {size}
              {i !== parsedSizes.length - 1 && ","}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 self-center">
          {parsedColorHexs.map((hex) => (
            <div className="p-0.25 relative flex items-center justify-center rounded-lg" key={hex}>
              <div
                style={{
                  backgroundColor: hex,
                }}
                className="h-5 w-5 rounded-lg border"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
