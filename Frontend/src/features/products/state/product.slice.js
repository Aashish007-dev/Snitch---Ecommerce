import { createSlice } from "@reduxjs/toolkit";


const productSlice = createSlice ({
    name: "product",
    initialState: {
        sellerProducts: []
    },
    reducers: {
        setSellerProduct: (state, action) => {
            state.sellerProducts = action.payload
        }
    }
})

export const {setSellerProduct} = productSlice.actions;

export default productSlice.reducer;