import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface CartState {
    value: Array<TCartProduct>;
}

export type TCartProduct = {
    price: string;
    quantity: number;
    size: string;
    size_index: number;
    name: string;
    sku: string;
    variant_image: string;
    id: number;
    sync_id: number;
    sync_variant_id: number;
    base_product_id: number;
};

const initialState: CartState = {
    value: [],
};

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<TCartProduct>) => {
            if (!action.payload) {
                throw new Error('payload missing in "addToCart" action');
            }

            const payload = action.payload;
            const isInCart = state.value.find((product) => product.sku === payload.sku);

            if (!isInCart) {
                state.value = [...state.value, payload];
            } else {
                isInCart.quantity += payload.quantity;
                state.value = [
                    ...state.value.filter((product) => product.sku !== isInCart.sku),
                    isInCart,
                ];
            }
        },
        removeFromCart: (state, action: PayloadAction<{ sku: string }>) => {
            if (!action.payload) {
                throw new Error("Payload missing in 'addToCart' action");
            }

            const payload = action.payload;
            const isInCart = state.value.find((product) => product.sku === payload.sku);

            if (!isInCart) {
                throw new Error("Product must be in the cart to remove it");
            }

            state.value = state.value.filter((product) => product.sku !== payload.sku);
        },
    },
});

// Action creators are generated for each case reducer function
export const { addToCart, removeFromCart } = cartSlice.actions;

export const cartReducer = cartSlice.reducer;

export const cartSelector = (state: RootState) => state.cart.value;
