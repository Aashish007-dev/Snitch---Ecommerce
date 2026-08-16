import { addItem, getCart, incrementCartItemApi, decrementCartItemApi, removeCartItemApi } from "../service/cart.api"
import { useDispatch } from "react-redux"
import { addItem as addItemToCart, setItems, incrementCartItem, decrementCartItem, removeCartItem, clearCart } from "../state/cart.slice"

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantId }) {
        const data = await addItem({ productId, variantId });
        return data;
    }

    async function handleGetCart() {
        try {
            const data = await getCart();
            dispatch(setItems(data.cart?.items || data.items || []))
            return data;
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            return null;
        }
    }

    async function handleIncrementCartItem({ productId, variantId }) {
        try {
            await incrementCartItemApi({ productId, variantId });
        } catch (err) {
            console.error("Increment cart error:", err);
        }
        dispatch(incrementCartItem({ productId, variantId }));
    }

    async function handleDecrementCartItem({ productId, variantId }) {
        try {
            await decrementCartItemApi({ productId, variantId });
        } catch (err) {
            console.error("Decrement cart error:", err);
        }
        dispatch(decrementCartItem({ productId, variantId }));
    }

    async function handleRemoveCartItem({ productId, variantId }) {
        try {
            await removeCartItemApi({ productId, variantId });
        } catch (err) {
            console.error("Remove cart error:", err);
        }
        dispatch(removeCartItem({ productId, variantId }));
    }

    function handleClearCart() {
        dispatch(clearCart());
    }

    return {
        handleAddItem,
        handleGetCart,
        handleIncrementCartItem,
        handleDecrementCartItem,
        handleRemoveCartItem,
        handleClearCart
    }
}