// 91989461

import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "../../utils/axiosClients";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const ProfilePage = () => {
  const orderId = 91989461;

  const order = useQuery(["order", orderId], async () => {
    const res = await apiInstance.get("/api/printful/order", {
      params: { orderId },
    });
    const data = res.data;
    console.log(data);
    return data;
  });

  if (order.isLoading) return <LoadingSpinner />;

  return <div>{JSON.stringify(order.data)}</div>;
};

export default ProfilePage;
