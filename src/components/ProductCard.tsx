import Link from "next/link";
import Image from "next/image";
import Stripe from "stripe";
import { currency } from "../utils/currency";
import { GetColorName } from "hex-color-to-color-name";

interface IProductCard {
    product: Stripe.Product;
}

export const ProductCard = ({ product }: IProductCard) => {
    const splitName = product.name.split(" ");
    const whichIndex = splitName.indexOf("Unisex");

    const shirtName = splitName.slice(0, whichIndex).join(" ");
    const defualtShirtName = splitName.slice(whichIndex).join(" ");

    const parsedColorHexs: string[] = JSON.parse(product.metadata.color_keys);

    return (
        <div className="max-w-[300px] rounded-md bg-slate-100 shadow-xl hover:outline hover:outline-1 md:self-start">
            <Link href={`/products/${product.metadata.id}`}>
                <Image
                    className="rounded-md border border-b-2"
                    src={product.metadata.thumbnail_url}
                    alt=""
                    width={400}
                    height={400}
                />
                <div className="flex flex-col items-start justify-center gap-2 rounded-md bg-white py-2 px-4">
                    <div>
                        <p className="text-lg font-bold md:text-xl">{shirtName}</p>
                        <p className="text-sm">{defualtShirtName}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-start gap-2 ">
                        {parsedColorHexs.map((hex) => (
                            <Link
                                href={`/products/${product.metadata.id}?color=${
                                    "%23" + hex.split("").splice(1).join("")
                                }`}
                                className="group relative z-10 flex items-center justify-center rounded-md"
                                key={hex}
                            >
                                <div
                                    style={{
                                        backgroundColor: hex,
                                    }}
                                    className="h-5 w-5  rounded-md border border-black"
                                />
                                <div
                                    style={{
                                        backgroundColor: hex,
                                        borderColor: hex,
                                    }}
                                    className="rouned-md absolute -top-10 right-0 z-10 hidden w-max translate-x-[40%] border px-2 py-1 font-bold text-white group-hover:block "
                                >
                                    <span className="drop-shadow-[1px_1px_1.5px_rgb(0,0,0)]">
                                        {GetColorName(hex)}
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
            </Link>
        </div>
    );
};
