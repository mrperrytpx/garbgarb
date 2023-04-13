import { ProductCard } from "../../components/ProductCard";
import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { PageError } from "../../utils/PageError";
import { ChangeEvent, useState } from "react";
import { stripe } from "../../lib/stripe";

async function getStoreData() {
  const products = await stripe.products.list({
    limit: 20,
    active: true,
  });

  const data = products.data;
  return data;
}

const ProductsPage = () => {
  const [productFilter, setProductFilter] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["store"],
    queryFn: getStoreData,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setProductFilter(e.target.value);
  }

  if (isLoading)
    return (
      <div className="m-auto flex flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  if (!error) return <PageError error={error} />;

  if (!data)
    return (
      <div className="m-auto flex flex-1 flex-col items-center justify-center gap-2">
        <p>There doesn't seem to be any products in this Store.</p>
        <p>That's crazy.</p>
      </div>
    );

  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-2 px-2 py-8 md:gap-8">
      <div className="flex h-12 w-full max-w-screen-sm justify-center">
        <input
          type="text"
          placeholder="Filter by name..."
          className="w-full rounded-md border-2 p-2"
          value={productFilter}
          onChange={handleChange}
        />
      </div>
      <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col flex-wrap items-center gap-8 md:flex-row md:justify-center">
        {data.length > 0 &&
          data.map((product) => <ProductCard key={product.id} product={product} />)}
        {!data.length && (
          <div className="mx-auto flex w-full flex-1 items-center justify-center gap-8 rounded-lg border-2">
            No such products :(
          </div>
        )}
      </div>
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
