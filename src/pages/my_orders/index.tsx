// 91989461
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { apiInstance } from "../../utils/axiosClients";
import { Order } from "@prisma/client";
import Link from "next/link";

const ProfilePage = () => {
  const allOrders = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await apiInstance.get<Order[]>("/api/printful/get_all_orders");
      const data = res.data;
      return data;
    },
  });

  if (allOrders.isLoading)
    return (
      <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-2">
        <p>Getting all orders...</p>
        <LoadingSpinner size={50} />
      </div>
    );

  return (
    <div>
      <div>Orders:</div>
      {allOrders.data?.map((x, i) => (
        <div className="cursor-pointer p-4 shadow-md" key={i}>
          <Link href={`/my_orders/${x.id}`}>{JSON.stringify(x)}</Link>
        </div>
      ))}
    </div>
  );
};

export default ProfilePage;

ProfilePage.auth = true;
