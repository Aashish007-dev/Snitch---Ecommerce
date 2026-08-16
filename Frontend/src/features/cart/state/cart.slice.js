import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
    },
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload || []
        },
        addItem: (state, action) => {
            state.items.push(action.payload)
        },
        incrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;

            state.items = state.items.map(item => {
                const itemVariantId = (typeof item.variant === 'object' && item.variant?._id) ? item.variant._id : item.variant;
                const itemProductId = (typeof item.product === 'object' && item.product?._id) ? item.product._id : item.product;

                if (itemProductId === productId && itemVariantId === variantId) {
                    return { ...item, quantity: (item.quantity || 1) + 1 }
                }
                return item
            })
        },
        decrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;

            state.items = state.items.map(item => {
                const itemVariantId = (typeof item.variant === 'object' && item.variant?._id) ? item.variant._id : item.variant;
                const itemProductId = (typeof item.product === 'object' && item.product?._id) ? item.product._id : item.product;

                if (itemProductId === productId && itemVariantId === variantId && item.quantity > 1) {
                    return { ...item, quantity: item.quantity - 1 }
                }
                return item
            })
        },
        removeCartItem: (state, action) => {
            const { productId, variantId } = action.payload;

            state.items = state.items.filter(item => {
                const itemVariantId = (typeof item.variant === 'object' && item.variant?._id) ? item.variant._id : item.variant;
                const itemProductId = (typeof item.product === 'object' && item.product?._id) ? item.product._id : item.product;

                return !(itemProductId === productId && itemVariantId === variantId)
            })
        },
        clearCart: (state) => {
            state.items = []
        }
    }
})

export const { setItems, addItem, incrementCartItem, decrementCartItem, removeCartItem, clearCart } = cartSlice.actions
export default cartSlice.reducer
