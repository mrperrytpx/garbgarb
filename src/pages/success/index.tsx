import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { emptyCart } from "../../redux/slices/cartSlice";

const Success = () => {
  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(emptyCart());
  // }, []);

  return <div className="flex-1">Success</div>;
};

export default Success;
