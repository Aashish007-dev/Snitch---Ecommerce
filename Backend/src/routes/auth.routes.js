import express from "express";
import { config } from "../config/config.js";
import {
  getMeController,
  googleCallback,
  loginController,
  registerController,
} from "../controllers/auth.controller.js";
import {
  validateRegisterUser,
  validateLoginUser,
} from "../validator/auth.validator.js";
import passport from "passport";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", validateRegisterUser, registerController);

authRouter.post("/login", validateLoginUser, loginController);

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: config.NODE_ENV == "development" ? "http://localhost:5173/login" : "/login",
  }),
  googleCallback,
);


authRouter.get("/me", authenticateUser, getMeController);

export default authRouter;
