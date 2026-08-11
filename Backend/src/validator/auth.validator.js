import {body, validationResult} from 'express-validator';

function validateRequest(req, res, next){
    const errors = validationResult(req);

    if(!errors.isEmpty) {
        return res.status(400).json({errors: errors.array()});
    };

    next();
}

export const validateRegisterUser = [
    body("email")
        .isEmail().withMessage("Invalid email format"),
    body("contact")
        .notEmpty().withMessage("Contact is required")
        .matches(/^[0-9]{10}$/).withMessage("Contact must be a 10-digit number"),
    body("password")
        .isLength({min: 6}).withMessage("Password must be atleast 6 character long"),
    body("fullname")
        .notEmpty().withMessage("Fullname is required")
        .isLength({min: 3}).withMessage("Fullname must be atleast 3 character long"),
    body("isSeller")
        .isBoolean().withMessage("isSeller must be a boolean value"),

    validateRequest
]

export const validateLoginUser = [
    body("email")
        .isEmail().withMessage("Invalid email format"),
    body("password")
        .notEmpty().withMessage("Password is required"),
    validateRequest
]