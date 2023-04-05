import { useMutation } from "@tanstack/react-query";
import { TCartProduct } from "../redux/slices/cartSlice";
import { ValidatedAddress } from "../pages/checkout";
import { apiInstance } from "../utils/axiosClients";
import { TShippingRatesResp } from "../pages/api/printful/shipping_rates";
import { Dispatch, SetStateAction } from "react";
import { ClearSuggestions } from "use-places-autocomplete";

interface IPostExtraCosts {
    productsInCart: TCartProduct[];
    address: ValidatedAddress;
}

export const useExtraCostsMutation = (
    setExtraCosts: Dispatch<SetStateAction<TShippingRatesResp | null>>,
    clearSuggestions: ClearSuggestions
) => {
    const postExtraCosts = async ({ productsInCart, address }: IPostExtraCosts) => {
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

    return useMutation(postExtraCosts, {
        onSuccess: (data) => setExtraCosts(data),
        onMutate: () => clearSuggestions(),
    });
};
