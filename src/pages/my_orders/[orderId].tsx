import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { apiInstance } from "../../utils/axiosClients";
import { TOrder, TOrderResponse } from "../api/stripe/webhooks";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const OrderPage = () => {
  const router = useRouter();
  const { orderId } = router.query;

  const orderData = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await apiInstance.get<TOrderResponse>("/api/printful/get_order", {
        params: {
          orderId,
        },
      });
      const data = res.data.result;
      return data;
    },
    enabled: !!orderId,
  });

  if (!orderId) return null;

  if (orderData.isLoading) return <LoadingSpinner size={100} />;

  return <div>{JSON.stringify(orderData.data)}</div>;
};

OrderPage.auth = true;

export default OrderPage;
