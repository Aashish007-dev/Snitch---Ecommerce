import { useState, useCallback } from "react";
import { addItem, getCart, incrementCartItemApi, decrementCartItemApi, removeCartItemApi, createCartOrder, verifyCartOrder } from "../service/cart.api";
import { useDispatch } from "react-redux";
import { setCart, incrementCartItem, decrementCartItem, removeCartItem, clearCart } from "../state/cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [updatingItems, setUpdatingItems] = useState({});

    const setItemUpdating = useCallback((key, isUpdating) => {
        setUpdatingItems(prev => ({ ...prev, [key]: isUpdating }));
    }, []);

    async function handleAddItem({ productId, variantId }) {
        const data = await addItem({ productId, variantId });
        return data;
    }

    const handleGetCart = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCart();
            if (data?.cart) {
                dispatch(setCart(data.cart));
                return data.cart;
            } else if (data?.items) {
                dispatch(setCart(data));
                return data;
            }
            dispatch(setCart(data));
            return data;
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    const handleIncrementCartItem = useCallback(async ({ productId, variantId }) => {
        const key = `${productId}_${variantId || 'default'}`;
        setItemUpdating(key, true);
        dispatch(incrementCartItem({ productId, variantId }));
        try {
            await incrementCartItemApi({ productId, variantId });
        } catch (err) {
            console.error("Increment cart error:", err);
            await handleGetCart();
        } finally {
            setItemUpdating(key, false);
        }
    }, [dispatch, handleGetCart, setItemUpdating]);

    const handleDecrementCartItem = useCallback(async ({ productId, variantId }) => {
        const key = `${productId}_${variantId || 'default'}`;
        setItemUpdating(key, true);
        dispatch(decrementCartItem({ productId, variantId }));
        try {
            await decrementCartItemApi({ productId, variantId });
        } catch (err) {
            console.error("Decrement cart error:", err);
            await handleGetCart();
        } finally {
            setItemUpdating(key, false);
        }
    }, [dispatch, handleGetCart, setItemUpdating]);

    const handleRemoveCartItem = useCallback(async ({ productId, variantId }) => {
        const key = `${productId}_${variantId || 'default'}`;
        setItemUpdating(key, true);
        dispatch(removeCartItem({ productId, variantId }));
        try {
            await removeCartItemApi({ productId, variantId });
        } catch (err) {
            console.error("Remove cart error:", err);
            await handleGetCart();
        } finally {
            setItemUpdating(key, false);
        }
    }, [dispatch, handleGetCart, setItemUpdating]);

    const handleClearCart = useCallback(() => {
        dispatch(clearCart());
    }, [dispatch]);

    async function handleCreateCartOrder(){
        const data = await createCartOrder();
        return data;
    }

    async function handleVerifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature}){
        const data = await verifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature});
        return data.success;
    }
    return {
        loading,
        updatingItems,
        handleAddItem,
        handleGetCart,
        handleIncrementCartItem,
        handleDecrementCartItem,
        handleRemoveCartItem,
        handleClearCart,
        handleCreateCartOrder,
        handleVerifyCartOrder
    };
};