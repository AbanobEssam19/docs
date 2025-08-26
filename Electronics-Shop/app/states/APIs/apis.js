import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    return data.products;
});

export const fetchUser = createAsyncThunk("user/fetchUser", async (token) => {
    const res = await fetch("/api/user", {
        headers: {
            'token': `${token}`
        }
    });
    const data = await res.json();
    return data.user;
});