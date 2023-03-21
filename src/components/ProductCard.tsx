import Link from "next/link";
import Image from "next/image";

interface IProductCard {
  name: string;
  thumbnail: string;
  id: number;
}

export const ProductCard = ({ name, thumbnail, id }: IProductCard) => {
  const splitName = name.split(" ");
  const whichIndex = splitName.indexOf("Unisex");

  const shirtName = splitName.slice(0, whichIndex).join(" ");
  const defualtShirtName = splitName.slice(whichIndex).join(" ");

  return (
    <div className="max-w-[350px] rounded-md border-2 border-b-8 md:self-start">
      <Link href={`/products/${id}`}>
        <Image className="border border-b-2" src={thumbnail} alt="" width={400} height={400} />
        <div className="p-2">
          <p className="text-center text-lg md:text-xl">{shirtName}</p>
          <p className="text-md text-center md:text-lg">{defualtShirtName}</p>
        </div>
      </Link>
    </div>
  );
};
