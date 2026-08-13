import express from 'express';
import { authenticateSeller } from '../middlewares/auth.middleware.js';
import { createProductController, getSellerProductsController } from '../controllers/product.controller.js';
import multer from 'multer';
import { createProductValidator } from '../validator/product.validator.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const productRouter = express.Router();

// @route POST /api/products/
// @description Create a new product
// @access Private (Seller only)

productRouter.post("/", authenticateSeller, createProductValidator , upload.array('images', 7) , createProductController);


// @route GET /api/products/seller
// @description Get all products of the authenticated seller
// @access Private (Seller only)

productRouter.get("/seller", authenticateSeller, getSellerProductsController);



export default productRouter;