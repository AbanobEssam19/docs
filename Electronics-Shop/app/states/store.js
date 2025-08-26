import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "./reducers/userSlice";
import { productsSlice } from "./reducers/productsSlice";
import { modalSlice } from "./reducers/modalSlice";

export default configureStore({
    reducer: {
        userData: userSlice.reducer,
        productsData: productsSlice.reducer,
        modalData: modalSlice.reducer
    }
});