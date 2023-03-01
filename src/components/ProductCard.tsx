import Link from "next/link";
import Image from "next/image";

interface IProductCard {
  name: string;
  thumbnail: string;
  id: number;
}

const ProductCard = ({ name, thumbnail, id }: IProductCard) => {
  const splitName = name.split(" ");
  const whichIndex = splitName.indexOf("Unisex");

  return (
    <div className="rounded-md border-2 border-b-8 md:self-start">
      <Link href={`/products/${id}`}>
        <Image className="border border-b-2" src={thumbnail} alt="" width={400} height={400} />
        <div className="p-2">
          <p className="text-center text-lg md:text-xl">
            {splitName.slice(0, whichIndex).join(" ")}
          </p>
          <p className="text-md text-center md:text-lg">{splitName.slice(whichIndex).join(" ")}</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;