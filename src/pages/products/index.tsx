import { ProductCard } from "../../components/ProductCard";
import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { PageError } from "../../utils/PageError";
import { ChangeEvent, useState } from "react";
import { stripe } from "../../lib/stripe";

type Size = "S" | "M" | "L" | "XL" | "2XL" | "3XL";
const SIZES: Size[] = ["S", "M", "L", "XL", "2XL", "3XL"];

async function getStoreData() {
  const products = await stripe.products.list({
    limit: 20,
    active: true,
  });
  if (!products) return [];

  const data = products.data;
  return data;
}

const ProductsPage = () => {
  const [productFilter, setProductFilter] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["store"],
    queryFn: getStoreData,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
    select: (data) => {
      const filteredByName = data.filter((x) =>
        x.name.toLowerCase().includes(productFilter.toLowerCase())
      );

      if (selectedSizes.length === 0) return filteredByName;
      const filteredBySize = filteredByName.filter((x) =>
        selectedSizes.some((y) => JSON.parse(x.metadata.sizes).includes(y))
      );
      return filteredBySize;
    },
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

  if (error) return <PageError error={error} />;

  if (!data)
    return (
      <div className="m-auto flex flex-1 flex-col items-center justify-center gap-2">
        <p>There doesn't seem to be any products in this Store.</p>
        <p>That's crazy.</p>
      </div>
    );

  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-8 px-2 py-8 md:gap-8">
      <div className="flex w-full max-w-screen-sm flex-col items-center justify-between gap-2 sm:flex-row lg:justify-start ">
        <input
          type="text"
          placeholder="Filter by name or color..."
          className="max-w-xs rounded-md border-2 p-2"
          value={productFilter}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          {SIZES.map((size) => (
            <div
              key={size}
              onClick={() =>
                setSelectedSizes((old) =>
                  old.includes(size) ? old.filter((x) => x !== size) : [...old, size]
                )
              }
              className="z-10 min-w-[40px] cursor-pointer select-none rounded-md border-2 border-black py-1 px-2 text-center font-bold transition-all"
              style={{
                backgroundColor: selectedSizes.includes(size) ? "black" : "",
                color: selectedSizes.includes(size) ? "white" : "",
              }}
            >
              {size}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col flex-wrap items-center gap-8 md:flex-row md:justify-center">
        {data.length > 0 &&
          data.map((product) => <ProductCard key={product.id} product={product} />)}
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
