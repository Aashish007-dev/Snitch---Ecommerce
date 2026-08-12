import express from 'express';
import { googleCallback, loginController, registerController } from '../controllers/auth.controller.js';
import { validateRegisterUser, validateLoginUser } from '../validator/auth.validator.js';
import passport from 'passport';


const authRouter = express.Router();

authRouter.post("/register", validateRegisterUser, registerController);

authRouter.post("/login", validateLoginUser, loginController);

authRouter.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}));

authRouter.get("/google/callback", passport.authenticate("google", {session: false}), googleCallback)

export default authRouter;