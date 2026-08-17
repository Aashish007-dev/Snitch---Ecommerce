import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validateAddToCart, validateIncrementCartItemQuantity } from '../validator/cart.validator.js';
import { addToCartController, decrementCartItemQuantityController, getCartController, incrementCartItemQuantityController, removeCartItemController } from '../controllers/cart.controller.js';

const cartRouter = express.Router();

// @route POST /api/cart/add/:productId/:variantId
// @description Add item to cart
// @access Private
// @argument productId - ID of the product to add
// @argument variantId - ID of the variant to add
// @argument quantity - Quantity of the item to add (optional, default: 1)

cartRouter.post("/add/:productId/:variantId", authenticateUser, validateAddToCart, addToCartController);

// @route GET /api/cart/
// @description Get user's cart
// @access Private

cartRouter.get("/", authenticateUser, getCartController);


// @route PATCH /api/cart/quantity/increment/:productId/:variantId
// @description Increment item quantity in cart by one
// @access Private 
// @argument ProductId - ID of the product to update
// @argument variantId - ID of the variant to update


cartRouter.patch("/quantity/increment/:productId/:variantId", authenticateUser, validateIncrementCartItemQuantity ,incrementCartItemQuantityController);

// @route PATCH /api/cart/quantity/decrement/:productId/:variantId
// @description Decrement item quantity in cart by one
// @access Private 
// @argument ProductId - ID of the product to update
// @argument variantId - ID of the variant to update

cartRouter.patch("/quantity/decrement/:productId/:variantId", authenticateUser, validateIncrementCartItemQuantity ,decrementCartItemQuantityController);


// @route PATCH /api/cart/quantity/remove/:productId/:variantId
// @description remove item quantity in cart by 0
// @access Private 
// @argument ProductId - ID of the product to update
// @argument variantId - ID of the variant to update

cartRouter.delete("/quantity/remove/:productId/:variantId", authenticateUser , removeCartItemController);

export default cartRouter;