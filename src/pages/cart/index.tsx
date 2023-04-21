import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { CartProduct } from "../../components/CartProduct";
import { currency } from "../../utils/currency";
import { LinkButton } from "../../components/LinkButton";

const CartPage = () => {
    const productsInCart = useSelector(cartSelector);

    if (!productsInCart.length)
        return (
            <div className="m-auto flex flex-col items-center justify-center gap-8 md:m-auto">
                <p className="self-center">Your cart is empty!</p>
                <p className="self-center text-2xl">(⌣̩̩́_⌣̩̩̀)</p>
                <LinkButton href="/products">Start shopping!</LinkButton>
            </div>
        );

    return (
        <div className="mx-auto my-4 flex w-full max-w-screen-lg flex-col gap-4 p-2 text-white md:flex-row md:items-start ">
            <div className="flex w-full flex-col items-center gap-2 md:flex-[2] ">
                {productsInCart.map((product) => (
                    <CartProduct key={product.sku} product={product} />
                ))}
            </div>
            {/*  */}
            <div className="mt-auto flex flex-col justify-center gap-2 border-t-2 md:m-0 md:flex-1 md:justify-start md:rounded-md md:border md:border-slate-300 md:px-4 md:py-6 md:shadow-md">
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
                    <p className="text-xs">Fees not applied</p>
                </div>
                <LinkButton href={productsInCart.some((x) => x.outOfStock) ? "/cart" : "/checkout"}>
                    CHECKOUT
                </LinkButton>
            </div>
        </div>
    );
};

export default CartPage;
