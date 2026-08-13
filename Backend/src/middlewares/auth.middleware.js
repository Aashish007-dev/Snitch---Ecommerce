import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import userModel from '../models/user.model.js';


export const authenticateSeller = async (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({success: false, message: "Unauthorized"});
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        if(!user) {
            return res.status(401).json({success: false, message: "Unauthorized"});
        };

        if(user.role !== "seller") {
            return res.status(401).json({success: false, message: "Forbidden"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({success: false, message: "Unauthorized"});
    }
}