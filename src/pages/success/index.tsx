import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { emptyCart } from "../../redux/slices/cartSlice";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "../../utils/axiosClients";
import { useRouter } from "next/router";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const SuccessPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { session_id } = router.query;

  // useEffect(() => {
  //   dispatch(emptyCart());
  // }, []);

  const addOrder = useQuery(
    ["idk"],
    async () => {
      const res = await apiInstance.get("/api/printful/test", {
        params: { session_id },
      });
      const data = res.data;
      return data;
    },
    {
      enabled: !!session_id,
    }
  );

  return <div className="flex-1">{session_id}</div>;
};

export default SuccessPage;
