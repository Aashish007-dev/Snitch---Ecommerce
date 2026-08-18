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
        const response = await cartApiInstance.delete(`/quantity/remove/${productId}/${variantId}`);
        return response.data;
    } catch {
        return null;
    }
}


export async function createCartOrder() {
    const response = await cartApiInstance.post("/payment/create/order");
    return response.data;
}


export async function verifyCartOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const response = await cartApiInstance.post("/payment/verify/order", { razorpay_order_id, razorpay_payment_id, razorpay_signature });
    return response.data;
}