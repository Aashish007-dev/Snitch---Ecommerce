import { createSlice } from "@reduxjs/toolkit";

const getIds = (item) => {
    const variantId = (typeof item.variant === 'object' && item.variant?._id)
        ? String(item.variant._id)
        : String(item.variant || '');
    const productId = (typeof item.product === 'object' && item.product?._id)
        ? String(item.product._id)
        : String(item.product || '');
    return { productId, variantId };
};

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        totalPrice: null,
        currency: "INR",
        items: [],
    },
    reducers: {
        setCart: (state, action) => {
            const payload = action.payload;
            if (!payload) {
                state.items = [];
                state.totalPrice = 0;
                return;
            }

            if (Array.isArray(payload)) {
                state.items = payload;
            } else if (Array.isArray(payload.items)) {
                state.items = payload.items;
                state.totalPrice = payload.totalPrice ?? null;
                state.currency = payload.currency || state.currency;
            } else if (payload.cart && Array.isArray(payload.cart.items)) {
                state.items = payload.cart.items;
                state.totalPrice = payload.cart.totalPrice ?? null;
                state.currency = payload.cart.currency || state.currency;
            } else {
                state.items = [];
            }
        },
        addItem: (state, action) => {
            if (!action.payload) return;
            state.items.push(action.payload);
        },
        incrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload || {};
            const pId = String(productId || '');
            const vId = String(variantId || '');

            state.items = state.items.map(item => {
                const ids = getIds(item);
                if (ids.productId === pId && (!vId || ids.variantId === vId)) {
                    return { ...item, quantity: (item.quantity || 1) + 1 };
                }
                return item;
            });
        },
        decrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload || {};
            const pId = String(productId || '');
            const vId = String(variantId || '');

            state.items = state.items.map(item => {
                const ids = getIds(item);
                if (ids.productId === pId && (!vId || ids.variantId === vId) && (item.quantity || 1) > 1) {
                    return { ...item, quantity: item.quantity - 1 };
                }
                return item;
            });
        },
        updateCartItemQuantity: (state, action) => {
            const { productId, variantId, quantity } = action.payload || {};
            const pId = String(productId || '');
            const vId = String(variantId || '');
            const newQty = Math.max(1, Number(quantity) || 1);

            state.items = state.items.map(item => {
                const ids = getIds(item);
                if (ids.productId === pId && (!vId || ids.variantId === vId)) {
                    return { ...item, quantity: newQty };
                }
                return item;
            });
        },
        removeCartItem: (state, action) => {
            const { productId, variantId } = action.payload || {};
            const pId = String(productId || '');
            const vId = String(variantId || '');

            state.items = state.items.filter(item => {
                const ids = getIds(item);
                if (ids.productId === pId && (!vId || ids.variantId === vId)) {
                    return false;
                }
                return true;
            });
        },
        clearCart: (state) => {
            state.items = [];
            state.totalPrice = 0;
        }
    }
});

export const {
    setCart,
    addItem,
    incrementCartItem,
    decrementCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart
} = cartSlice.actions;

export default cartSlice.reducer;

