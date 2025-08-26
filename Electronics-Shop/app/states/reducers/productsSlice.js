import { createSlice } from "@reduxjs/toolkit";
import { fetchProducts } from "../APIs/apis";

export const productsSlice = createSlice({
    name: "productsData",

    initialState: {
        data: null
    },

    reducers: {
        updateProducts: (state, action) => {
            state.data = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProducts.fulfilled, (state, action) => {
            state.data = action.payload;
        });
    }
});

export const { updateProducts } = productsSlice.actions;
export default productsSlice.reducer;