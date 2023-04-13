import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "../utils/axiosClients";
import { TProductSizes } from "../pages/api/product/sizes";

export async function getProductSizes(productId: number) {
    const sizesRes = await apiInstance.get<TProductSizes>("/api/product/sizes", {
        params: { id: productId },
    });

    const sizesData = sizesRes.data;
    return sizesData;
}

export const useGetProductSizes = (productId: number | undefined, isSizeGuideOpen: boolean) => {
    return useQuery({
        queryKey: ["sizes", productId],
        queryFn: () => getProductSizes(productId!),
        enabled: !!isSizeGuideOpen,
        staleTime: 1000 * 60 * 10,
    });
};
