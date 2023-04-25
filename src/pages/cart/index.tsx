import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { CartProduct } from "../../components/CartProduct";
import { currency } from "../../utils/currency";
import { LinkButton } from "../../components/LinkButton";
import Head from "next/head";
import Link from "next/link";

const CartPage = () => {
    const productsInCart = useSelector(cartSelector);

    if (!productsInCart.length)
        return (
            <>
                <Head>
                    <title>GarbGarb - Empty Cart</title>
                </Head>
                <div className="m-auto flex flex-col items-center justify-center gap-8 text-gray-200 md:m-auto">
                    <p className="self-center">Your cart is empty!</p>
                    <p className="self-center text-4xl">😥😅😫😭😨😱</p>
                    <LinkButton
                        className="border-slate-500 bg-black shadow-sm shadow-slate-500 hover:bg-slate-200 hover:text-black focus:bg-slate-200 focus:text-black"
                        href="/products"
                    >
                        Start shopping!
                    </LinkButton>
                </div>
            </>
        );

    return (
        <>
            <Head>
                <title>GarbGarb - My Cart</title>
            </Head>
            <div className="mx-auto my-4 flex w-full max-w-screen-lg flex-col gap-4 p-2 text-gray-200 md:flex-row md:items-start ">
                <div className="flex w-full flex-col items-center gap-2 md:flex-[2] ">
                    {productsInCart.map((product) => (
                        <CartProduct key={product.sku} product={product} />
                    ))}
                </div>
                {/*  */}
                <div className="mt-auto flex flex-col justify-center gap-2 border-t-2 bg-black md:m-0 md:flex-1 md:justify-start md:rounded-md md:border-t-0 md:px-4 md:py-6">
                    <div className="flex w-full flex-col items-center justify-center gap-0.5 py-3 md:rounded-md">
                        <div className="flex items-center justify-start gap-2">
                            <p>Subtotal:</p>
                            <p className="text-lg font-bold">
                                {currency(
                                    productsInCart.reduce(
                                        (prev, curr) => prev + +curr.price * curr.quantity,
                                        0
                                    )
                                )}
                            </p>
                        </div>
                        <Link
                            href="/static/returns-faq#fees"
                            className="text-xs hover:animate-hop hover:underline focus:animate-hop focus:underline"
                        >
                            Fees not applied
                        </Link>
                    </div>
                    <LinkButton
                        className="border border-slate-500 shadow-sm shadow-slate-500 hover:bg-slate-200 hover:text-black focus:bg-slate-200 focus:text-black"
                        href={productsInCart.some((x) => x.outOfStock) ? "/cart" : "/checkout"}
                    >
                        CHECKOUT
                    </LinkButton>
                </div>
            </div>
        </>
    );
};

export default CartPage;
