import {body, validationResult} from 'express-validator';

function validateRequest(req, res, next){
    const errors = validationResult(req);

    if(!errors.isEmpty) {
        return res.status(400).json({errors: errors.array()});
    };

    next();
}


export const createProductValidator = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isLength({min: 3}).withMessage("Title must be atleast 3 character long"),
    body("description")
        .notEmpty().withMessage("Description is required")
        .isLength({min: 10}).withMessage("Description must be atleast 10 character long"),
    body("priceAmount")
        .notEmpty().withMessage("Price amount is required")
        .isNumeric().withMessage("Price amount must be a number"),
    body("priceCurrency")
        .notEmpty().withMessage("Price currency is required")
        .isIn(["USD", "EUR", "GBP", "JPY", "INR"]).withMessage("Price currency must be one of USD, EUR, GBP, JPY, INR"),
    validateRequest
]