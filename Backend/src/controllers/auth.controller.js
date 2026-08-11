import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse (user, res, message) {
    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, {expiresIn: '7d'})

    res.cookie("token", token);

    res.status(200).json({
        message,
        success: true,
        token,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    });
}

export const registerController = async (req, res) => {
    const {email, contact, fullname, password, isSeller} = req.body;

    try {
        const existingUser = await userModel.findOne({
            $or: [
                {email},
                {contact}
            ]
        })

        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email or contact"
            })
        }

        const user = await userModel.create({
            email,
            contact,
            fullname,
            password,
            role: isSeller ? "seller" : "buyer"
        });

        await sendTokenResponse(user, res, "User registered successfully.")

        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Server Error"})
    }
}