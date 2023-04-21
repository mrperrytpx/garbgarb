import { ProductCard } from "../../components/ProductCard";
import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { PageError } from "../../components/PageError";
import { ChangeEvent, useState } from "react";
import { stripe } from "../../lib/stripe";
import { Breadcrumbs } from "../../components/Breadcrumbs";

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
            const filteredByName = data.filter(
                (product) =>
                    product.name.toLowerCase().includes(productFilter) ||
                    product.metadata.color_names.includes(productFilter)
            );

            if (selectedSizes.length === 0) return filteredByName;
            const filteredBySize = filteredByName.filter((product) =>
                selectedSizes.some((size) => JSON.parse(product.metadata.sizes).includes(size))
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

    const handleSizeSelect = (size: string) => {
        setSelectedSizes((old) =>
            old.includes(size) ? old.filter((x) => x !== size) : [...old, size]
        );
    };

    return (
        <div className="mb-8 flex w-full flex-1 flex-col items-center justify-start gap-6 p-4 md:gap-8">
            <Breadcrumbs />
            <div className="flex w-full max-w-screen-sm flex-col items-center justify-between gap-2 px-1 sm:flex-row lg:justify-start ">
                <input
                    type="text"
                    placeholder="Filter by name or color..."
                    className="max-w-xs rounded-md border-2 p-2"
                    value={productFilter}
                    onChange={handleChange}
                />
                <div className="flex h-full flex-wrap items-center justify-center gap-2">
                    {SIZES.map((size) => (
                        <div
                            key={size}
                            tabIndex={0}
                            onClick={() => handleSizeSelect(size)}
                            onKeyDown={(e) => {
                                if (e.code === "Space") {
                                    e.preventDefault();
                                    handleSizeSelect(size);
                                }
                            }}
                            className="z-10 flex h-full max-h-9 w-12 cursor-pointer select-none items-center justify-center rounded-md border-2 border-slate-200 py-1 px-2 font-bold text-white transition-all"
                            style={{
                                backgroundColor: selectedSizes.includes(size) ? "white" : "",
                                color: selectedSizes.includes(size) ? "black" : "",
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
