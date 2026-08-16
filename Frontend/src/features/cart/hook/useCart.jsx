import { addItem } from "../service/cart.api"
import { useDispatch, useSelector } from "react-redux"
import { addItem as addItemToCart } from "../state/cart.slice"



export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantId }) {

        const data = await addItem({ productId, variantId });
        // dispatch(addItemToCart(data.item))

        return data
    }

    return {
        handleAddItem
    }
}