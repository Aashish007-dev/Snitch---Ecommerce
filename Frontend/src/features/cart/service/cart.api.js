import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
});

export async function addItem({ productId, variantId }) {
    const response = await cartApiInstance.post(`/add/${productId}/${variantId}`, { quantity: 1 });
    return response.data;
}

export async function getCart() {
    const response = await cartApiInstance.get(`/`);
    return response.data;
}

export async function incrementCartItemApi({ productId, variantId }) {
    const response = await cartApiInstance.patch(`/quantity/increment/${productId}/${variantId}`);
    return response.data;
}

export async function decrementCartItemApi({ productId, variantId }) {
        const response = await cartApiInstance.patch(`/quantity/decrement/${productId}/${variantId}`);
        return response.data;
    
}

export async function removeCartItemApi({ productId, variantId }) {
    try {
        const response = await cartApiInstance.delete(`/item/${productId}/${variantId}`);
        return response.data;
    } catch {
        return null;
    }
}