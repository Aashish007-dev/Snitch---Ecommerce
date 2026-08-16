import {body, validationResult, param} from 'express-validator';

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);   
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateAddToCart = [
    param("productId").isMongoId().notEmpty().withMessage("Product ID is required"),
    param("variantId").notEmpty().isMongoId().withMessage("Variant ID is required"),
    body("quantity").optional().isInt({min: 1}).withMessage("Quantity must be a atleast 1"),

    validateRequest
]

export const validateIncrementCartItemQuantity = [
    param("productId").isMongoId().notEmpty().withMessage("Invalid Product ID "),
    param("variantId").notEmpty().isMongoId().withMessage("Invalid Variant ID"),

    validateRequest
]