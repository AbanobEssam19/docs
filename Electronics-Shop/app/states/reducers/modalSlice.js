import { createSlice } from "@reduxjs/toolkit";

export const modalSlice = createSlice({
    name: "modalData",

    initialState: {
        data: null
    },

    reducers: {
        updateModal: (state, action) => {
            state.data = action.payload;
        }
    }
});

export const { updateModal } = modalSlice.actions;
export default modalSlice.reducer;