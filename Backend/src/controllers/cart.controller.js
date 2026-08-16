import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";

export const addToCartController = async (req, res) => {
    const {productId, variantId} = req.params;
    const {quantity = 1} = req.body;

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
        const quantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId)

        if(quantityInCart + quantity > stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${stock - quantityInCart} items left in stock and you already have ${quantityInCart} items in your cart.`
            })
        }

        await cartModel.findOneAndUpdate(
            {user: req.user._id, "items.product": productId, "items.variant": variantId},
            {$inc: {"items.$.quantity": quantity}},
            {new: true}
        )

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully."
        })
    }

    if (quantity > stock) {
        return res.status(400).json({
            success: false,
            message: `Only ${stock} items left in stock`
        })
    }   

    cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price: {
            amount: product.price.amount,
            currency: product.price.currency
        }
    })

    await cart.save();

    return res.status(200).json({
        success: true,
        message: "Product added to cart successfully."
    })

}

export const getCartController = async (req, res) => {
    const user = req.user;

    let cart = await cartModel.findOne({user: user._id}).populate("items.product");

    if(!cart) {
        cart = await cartModel.create({user: user._id});
    }

    return res.status(200).json({
        success: true,
        message: "Cart fetched successfully.",
        cart
    })
}