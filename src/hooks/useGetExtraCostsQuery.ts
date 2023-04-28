import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { cartSelector } from "../redux/slices/cartSlice";
import { apiInstance } from "../utils/axiosClients";
import { TShippingRatesResp } from "../pages/api/printful/shipping_rates";
import { ValidatedAddress, ValidatedForm } from "../pages/checkout";

export const useGetExtraCostsQuery = (formData: ValidatedForm | undefined) => {
    const productsInCart = useSelector(cartSelector);

    const postExtraCosts = async () => {
        const items = productsInCart.filter((x) => !x.outOfStock);

        if (!formData) return;

        const address: ValidatedAddress = {
            streetName: formData.streetName,
            streetNumber: formData.streetNumber,
            city: formData.city,
            country: formData.country,
            zip: formData.zip,
            subpremise: formData.subpremise,
        };

        const response = await apiInstance.post<TShippingRatesResp>(
            "/api/printful/shipping_rates",
            {
                cartItems: items,
                address,
            }
        );
        const data = response.data;
        return data;
    };

    return useQuery({
        queryKey: ["costs", formData?.country, productsInCart.length],
        queryFn: postExtraCosts,
        enabled: !!formData,
        refetchOnWindowFocus: false,
    });
};
