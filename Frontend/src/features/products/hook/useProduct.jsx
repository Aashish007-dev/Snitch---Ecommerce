import { setSellerProduct, setProducts } from "../state/product.slice";
import { createProduct, getSellerProduct, getAllProducts, getProductById, addProductVariant } from "../service/product.api";
import { useDispatch } from "react-redux";



export const useProduct = () => {
    const dispatch = useDispatch();

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData);

        return data.product;
    }

    async function handleGetSellerProduct() {
        const data = await getSellerProduct();

        dispatch(setSellerProduct(data.products));

        return data.products;
    }

    async function handleGetAllProduct() {
        const data = await getAllProducts();

        dispatch(setProducts(data.products));

        return data.products;
    }

    async function handleGetProductById(productId) {
        const data = await getProductById(productId);
        return data.product;
    }


    async function handleAddProductVariant(productId, newProductVariant) {
        const data = await addProductVariant(productId, newProductVariant);
        return data;
    }

    return {
        handleGetSellerProduct,
        handleCreateProduct,
        handleGetAllProduct,
        handleGetProductById,
        handleAddProductVariant
    }
}