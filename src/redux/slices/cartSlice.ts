import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface CartState {
    value: number;
}

const initialState: CartState = {
    value: 0,
};

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.value += 1;
        },
        removeFromCart: (state) => {
            state.value -= 1;
        },
    },
});

// Action creators are generated for each case reducer function
export const { addToCart, removeFromCart } = cartSlice.actions;

export const cartReducer = cartSlice.reducer;

export const cartSelector = (state: RootState) => state.cart.value;
