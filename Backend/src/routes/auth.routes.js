import express from 'express';
import { registerController } from '../controllers/auth.controller.js';
import { validateRegisterUser } from '../validator/auth.validator.js';


const authRouter = express.Router();

authRouter.post("/register", validateRegisterUser, registerController)


export default authRouter;