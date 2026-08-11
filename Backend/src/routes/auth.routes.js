import express from 'express';
import { loginController, registerController } from '../controllers/auth.controller.js';
import { validateRegisterUser, validateLoginUser } from '../validator/auth.validator.js';


const authRouter = express.Router();

authRouter.post("/register", validateRegisterUser, registerController);

authRouter.post("/login", validateLoginUser, loginController)


export default authRouter;