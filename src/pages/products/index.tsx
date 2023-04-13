import { apiInstance } from "../../utils/axiosClients";
import type { TProduct } from "../api/store";
import { ProductCard } from "../../components/ProductCard";
import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { PageError } from "../../utils/PageError";

async function getStoreData() {
  const res = await apiInstance.get<TProduct[]>("/api/store");

  const data = res.data;
  return data;
}

const ProductsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["store"],
    queryFn: getStoreData,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  if (isLoading)
    return (
      <div className="m-auto flex flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  if (!data) return <PageError error={error} />;

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
