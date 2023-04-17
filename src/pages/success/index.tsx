import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { emptyCart } from "../../redux/slices/cartSlice";
import { useRouter } from "next/router";

const SuccessPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { session_id } = router.query;

  // useEffect(() => {
  //   dispatch(emptyCart());
  // }, []);

  return <div className="flex-1">{session_id}</div>;
};

export default SuccessPage;
