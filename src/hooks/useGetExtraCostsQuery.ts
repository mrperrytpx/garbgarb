import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { cartSelector } from "../redux/slices/cartSlice";
import { apiInstance } from "../utils/axiosClients";
import { TShippingRatesResp } from "../pages/api/printful/shipping_rates";
import { ValidatedAddress } from "../pages/checkout";

export const useGetExtraCostsQuery = (address: ValidatedAddress | undefined) => {
    const productsInCart = useSelector(cartSelector);

    const postExtraCosts = async () => {
        const response = await apiInstance.post<TShippingRatesResp>(
            "/api/printful/shipping_rates",
            {
                cartItems: productsInCart,
                address,
            }
        );
        const data = response.data;
        return data;
    };

    return useQuery({
        queryKey: ["costs", address?.country, productsInCart.length],
        queryFn: postExtraCosts,
        enabled: !!address,
        refetchOnWindowFocus: false,
    });
};
