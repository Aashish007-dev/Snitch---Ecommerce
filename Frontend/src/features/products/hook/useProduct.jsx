import { setSellerProduct } from "../state/product.slice";
import { createProduct, getSellerProduct } from "../service/product.api";
import { useDispatch } from "react-redux";



export const useProduct = () => {
    const dispatch = useDispatch();

    async function handleCreateProduct (formData) {
        const data = await createProduct(formData);

        return data.product;
    }

    async function handleGetSellerProduct () {
        const data = await getSellerProduct();

        dispatch(setSellerProduct(data.products));

        return data.products;
    }

    return {
        handleGetSellerProduct,
        handleCreateProduct
    }
}