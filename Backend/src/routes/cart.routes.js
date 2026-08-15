import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validateAddToCart } from '../validator/cart.validator.js';
import { addToCartController } from '../controllers/cart.controller.js';

const cartRouter = express.Router();

// @route POST /api/cart/add/:productId/:variantId
// @description Add item to cart
// @access Private
// @argument productId - ID of the product to add
// @argument variantId - ID of the variant to add
// @argument quantity - Quantity of the item to add (optional, default: 1)

cartRouter.post("/add/:productId/:variantId", authenticateUser, validateAddToCart, addToCartController);



export default cartRouter;