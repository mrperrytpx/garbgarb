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

    const parsedColorHexs: string[] = JSON.parse(product.metadata.color_keys);
    const parsedColorNames: string[] = JSON.parse(product.metadata.color_names);

    return (
        <div className="w-full max-w-[300px] rounded-md bg-slate-200 shadow-xl transition-all duration-75 hover:scale-105 md:self-start">
            <div>
                <Link
                    aria-label={`Product with ID ${product.metadata.id}`}
                    href={`/products/${product.metadata.id}`}
                >
                    <Image
                        className="aspect-square rounded-md border border-b-2"
                        src={product.metadata.thumbnail_url}
                        alt="Product"
                        placeholder="blur"
                        priority={true}
                        blurDataURL="iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNkqGfAAIxDWRAAOIQFAap6xDkAAAAASUVORK5CYII="
                        width={500}
                        height={500}
                    />
                </Link>
                <div className="flex w-full max-w-[300px] flex-col items-start justify-center gap-2 rounded-md bg-white px-4 py-2">
                    <div>
                        <p className="text-lg font-bold md:text-xl">{shirtName}</p>
                        <p className="text-sm">{defualtShirtName}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-start gap-4">
                        {parsedColorHexs.map((hex, i) => (
                            <Link
                                href={`/products/${product.metadata.id}?color=${
                                    "%23" + hex.split("").splice(1).join("")
                                }`}
                                className="group relative z-10 flex items-center justify-center rounded-md shadow-sm shadow-slate-500 hover:animate-hop"
                                key={hex}
                                aria-label={`Product with ID ${product.metadata.id} and color ${parsedColorNames[i]}`}
                            >
                                <div
                                    style={{
                                        backgroundColor: hex,
                                    }}
                                    className="h-6 w-6 rounded-md border border-black"
                                />
                                <div
                                    style={{
                                        backgroundColor: hex,
                                    }}
                                    className="rouned-md absolute -top-10 right-0 z-10 hidden w-max translate-x-[40%] rounded-md border border-black px-2 py-1 font-bold text-gray-200 group-hover:block "
                                >
                                    <span className="drop-shadow-[1px_1px_1.5px_rgb(0,0,0)]">
                                        {parsedColorNames[i]}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <p>
                        from{" "}
                        <span className="font-semibold">
                            {currency(product.metadata.starting_price)}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};
