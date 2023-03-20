import { useDispatch, useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { removeFromCart } from "../../redux/slices/cartSlice";

const CartPage = () => {
  const productsInCart = useSelector(cartSelector);
  const dispatch = useDispatch();

  return (
    <div>
      {productsInCart.length ? (
        productsInCart.map((product) => (
          <div>
            <div>
              {product.name} {product.size}
            </div>
            <div>{product.quantity}</div>
            <button
              onClick={() => dispatch(removeFromCart({ sku: product.sku }))}
              className="border-2 p-4"
            >
              X
            </button>
          </div>
        ))
      ) : (
        <div>No Items in cart :(</div>
      )}
    </div>
  );
};

export default CartPage;
