import express from 'express';
import { authenticateSeller } from '../middlewares/auth.middleware.js';
import { createProductController } from '../controllers/product.controller.js';
import multer from 'multer';
import { createProductValidator } from '../validator/product.validator.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})


const productRouter = express.Router();

productRouter.post("/", authenticateSeller, createProductValidator , upload.array('images', 7) , createProductController);



export default productRouter;