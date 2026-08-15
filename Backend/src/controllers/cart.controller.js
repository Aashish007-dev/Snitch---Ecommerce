import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../config/dao/product.dao.js";

export const addToCartController = async (req, res) => {
    const {productId, variantId} = req.params;

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    });

    if(!product) {
        return res.status(404).json({
            success: false,
            message: "Product or variant not Found"
        })
    };

    const stock = await stockOfVariant(productId, variantId);

    const cart = (await cartModel.findOne({user: req.user._id})) || 
                (await cartModel.create({user: req.user._id}))

    const isProductAlreadyInCart = cart.items.some(item => item.product.toString() === productId && item.variant?.toString() === variantId);

    if (isProductAlreadyInCart) {
        
    }

}