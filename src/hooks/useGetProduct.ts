import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "../utils/axiosClients";
import { TProductDetailsResult } from "../pages/api/product";

export async function getProduct(productId: string | string[] | undefined) {
    const res = await apiInstance.get<TProductDetailsResult>("/api/product", {
        params: { id: productId },
    });

    const data = res.data;
    return data;
}

export const useGetProduct = (productId: string | string[] | undefined) => {
    return useQuery({
        queryKey: ["product", productId],
        queryFn: () => getProduct(productId),
        staleTime: 1000 * 60 * 10,
        enabled: !!productId,
    });
};
