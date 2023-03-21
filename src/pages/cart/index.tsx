import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { CartProduct } from "../../components/CartProduct";

const CartPage = () => {
  const productsInCart = useSelector(cartSelector);

  return (
    <div className="flex flex-1 flex-col gap-4 p-2">
      {productsInCart.map((product) => (
        <CartProduct product={product} />
      ))}
    </div>
  );
};

export default CartPage;
