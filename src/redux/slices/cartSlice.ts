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
    store_product_variant_id: number;
    store_product_id: number;
    base_product_variant_id: number;
    base_product_id: number;
    color_name: string;
    color_code: string;
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
            const product = state.value.find((product) => product.sku === payload.sku);

            if (!product) {
                state.value = [...state.value, payload];
            } else {
                product.quantity += payload.quantity;
                state.value = [
                    ...state.value.filter((product) => product.sku !== product.sku),
                    product,
                ];
            }
        },
        removeFromCart: (state, action: PayloadAction<{ sku: string }>) => {
            if (!action.payload) {
                throw new Error("Payload missing in 'removeFromCart' action");
            }

            const payload = action.payload;
            const product = state.value.find((product) => product.sku === payload.sku);

            if (!product) {
                throw new Error("Product must be in the cart to remove it");
            }

            state.value = [...state.value.filter((product) => product.sku !== payload.sku)];
        },
        increaseQuantity: (state, action: PayloadAction<{ sku: string }>) => {
            if (!action.payload) {
                throw new Error("Payload missing in 'increaseQuantity' action");
            }

            const payload = action.payload;
            const product = state.value.find((product) => product.sku === payload.sku);

            if (!product) {
                throw new Error("Product must be in the cart to increase its quantity");
            }

            product.quantity += 1;

            state.value = [...state.value];
        },
        decreaseQuantity: (state, action: PayloadAction<{ sku: string }>) => {
            if (!action.payload) {
                throw new Error("Payload missing in 'increaseQuantity' action");
            }

            const payload = action.payload;
            const product = state.value.find((product) => product.sku === payload.sku);

            if (!product) {
                throw new Error("Product must be in the cart to decrease its quantity");
            }

            product.quantity -= 1;
            if (product.quantity <= 0) {
                state.value = [...state.value.filter((product) => product.sku !== payload.sku)];
            } else {
                state.value = [...state.value];
            }
        },
        emptyCart: (state) => {
            state.value = [];
        },
    },
});

// Action creators are generated for each case reducer function
export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, emptyCart } =
    cartSlice.actions;

export const cartReducer = cartSlice.reducer;

export const cartSelector = (state: RootState) => state.cart.value;
