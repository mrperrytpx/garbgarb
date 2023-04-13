import { apiInstance } from "../../utils/axiosClients";
import type { TProduct } from "../api/store";
import { ProductCard } from "../../components/ProductCard";
import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";

async function getStoreData() {
  const res = await apiInstance.get<TProduct[]>("/api/store");

  if (res.status >= 400) throw new Error("Invalid store? or something idno");

  const data = res.data;
  return data;
}

const ProductsPage = () => {
  const { data } = useQuery({
    queryKey: ["store"],
    queryFn: getStoreData,
  });

  if (!data) return <div>Yikes lmao</div>;

  return (
    <div className="flex flex-1 flex-col flex-wrap items-center justify-center gap-8 py-8 md:flex-row">
      {data.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          thumbnail={product.thumbnail_url}
        />
      ))}
    </div>
  );
};

export default ProductsPage;

export const getServerSideProps = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(["store"], getStoreData);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
