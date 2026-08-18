import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
    addItem as addItemApi,
    getCart as getCartApi,
    incrementCartItemApi,
    decrementCartItemApi,
    removeCartItemApi
} from "../service/cart.api";
import {
    setCart,
    incrementCartItem,
    decrementCartItem,
    removeCartItem,
    clearCart
} from "../state/cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [updatingItems, setUpdatingItems] = useState({});

    const setItemLoading = useCallback((itemKey, isBusy) => {
        setUpdatingItems(prev => ({ ...prev, [itemKey]: isBusy }));
    }, []);

    const handleGetCart = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCartApi();
            if (data?.cart) {
                dispatch(setCart(data.cart));
                return data.cart;
            } else if (data?.items) {
                dispatch(setCart(data));
                return data;
            } else if (Array.isArray(data)) {
                dispatch(setCart({ items: data }));
                return { items: data };
            }
            dispatch(setCart({ items: [] }));
            return null;
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    const handleAddItem = useCallback(async ({ productId, variantId, quantity = 1 }) => {
        try {
            const data = await addItemApi({ productId, variantId, quantity });
            if (data?.cart) {
                dispatch(setCart(data.cart));
            } else {
                await handleGetCart();
            }
            return { success: true, data };
        } catch (err) {
            console.error("Add to cart error:", err);
            return { success: false, error: err?.response?.data?.message || err.message };
        }
    }, [dispatch, handleGetCart]);

    const handleIncrementCartItem = useCallback(async ({ productId, variantId }) => {
        const itemKey = `${productId}_${variantId || 'default'}`;
        setItemLoading(itemKey, true);
        // Optimistic UI update
        dispatch(incrementCartItem({ productId, variantId }));
        try {
            const res = await incrementCartItemApi({ productId, variantId });
            if (res?.cart) {
                dispatch(setCart(res.cart));
            }
            return { success: true };
        } catch (err) {
            console.error("Increment cart item error:", err);
            // Re-fetch to sync true server state
            await handleGetCart();
            return { success: false, error: err };
        } finally {
            setItemLoading(itemKey, false);
        }
    }, [dispatch, handleGetCart, setItemLoading]);

    const handleDecrementCartItem = useCallback(async ({ productId, variantId }) => {
        const itemKey = `${productId}_${variantId || 'default'}`;
        setItemLoading(itemKey, true);
        // Optimistic UI update
        dispatch(decrementCartItem({ productId, variantId }));
        try {
            const res = await decrementCartItemApi({ productId, variantId });
            if (res?.cart) {
                dispatch(setCart(res.cart));
            }
            return { success: true };
        } catch (err) {
            console.error("Decrement cart item error:", err);
            await handleGetCart();
            return { success: false, error: err };
        } finally {
            setItemLoading(itemKey, false);
        }
    }, [dispatch, handleGetCart, setItemLoading]);

    const handleRemoveCartItem = useCallback(async ({ productId, variantId }) => {
        const itemKey = `${productId}_${variantId || 'default'}`;
        setItemLoading(itemKey, true);
        // Optimistic UI update
        dispatch(removeCartItem({ productId, variantId }));
        try {
            const res = await removeCartItemApi({ productId, variantId });
            if (res?.cart) {
                dispatch(setCart(res.cart));
            }
            return { success: true };
        } catch (err) {
            console.error("Remove cart item error:", err);
            await handleGetCart();
            return { success: false, error: err };
        } finally {
            setItemLoading(itemKey, false);
        }
    }, [dispatch, handleGetCart, setItemLoading]);

    const handleClearCart = useCallback(() => {
        dispatch(clearCart());
    }, [dispatch]);

    return {
        loading,
        updatingItems,
        handleAddItem,
        handleGetCart,
        handleIncrementCartItem,
        handleDecrementCartItem,
        handleRemoveCartItem,
        handleClearCart
    };
};