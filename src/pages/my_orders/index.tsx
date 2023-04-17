// 91989461
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { apiInstance } from "../../utils/axiosClients";
import { Order } from "@prisma/client";
import Link from "next/link";
import { currency } from "../../utils/currency";

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
    <div className="mx-auto my-2 w-full max-w-screen-md p-2">
      <h1 className="w-full border-b-2 font-bold uppercase">Orders:</h1>
      <div className="mt-2 flex flex-col gap-4">
        {allOrders.data?.map((x, i) => (
          <Link key={i} className="rounded-md p-4 shadow-md " href={`/my_orders/${x.id}`}>
            <div className="flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between gap-4">
                <span className="underline">#{x.id}</span>
                <strong className="min-w-[70px] text-right">{currency(x.totalAmount / 100)}</strong>
              </div>
              <span>
                {new Intl.DateTimeFormat("en-GB", {
                  weekday: "short",
                  year: "2-digit",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date(x.createdAt))}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;

ProfilePage.auth = true;
