import { useQuery } from "@tanstack/react-query";
import { TWarehouseResult } from "../pages/api/product/availability";
import { apiInstance } from "../utils/axiosClients";

export async function getProductAvailability(productId: number | undefined) {
    const availabilityRes = await apiInstance.get<TWarehouseResult>("/api/product/availability", {
        params: { id: productId },
    });

    const availabilityData = availabilityRes.data;
    return availabilityData;
}

export const useGetProductAvailability = (productId: number | undefined) => {
    return useQuery({
        queryKey: ["availability", productId],
        queryFn: () => getProductAvailability(productId),
        staleTime: 1000 * 60 * 10,
        enabled: !!productId,
    });
};
