// Purpose: Define the URL and HTTP method for authentication endpoints.
import { Router } from "express";
import { validate } from "@/middlewares/schema-middleware";
import { requireAuth } from "@/middlewares/auth-middleware";
import {
    register,
    login,
    logout,
    passwordReset,
    forgotPassword,
    refreshToken,
    verifyEmail,
    resendVerification,
    getMe,
} from "@/controllers/auth-controllers";
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
    refreshTokenSchema,
    logoutSchema,
    verifyEmailSchema,
    resendVerificationSchema,
} from "@/schema/auth-schema";

const authRouter = Router();

// Public auth endpoints
authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/logout", validate(logoutSchema), logout);
authRouter.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", validate(resetPasswordSchema), passwordReset);
authRouter.post("/refresh-token", validate(refreshTokenSchema), refreshToken);
authRouter.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
authRouter.post("/resend-verification", validate(resendVerificationSchema), resendVerification);

// Protected user profile endpoint
authRouter.get("/me", requireAuth, getMe);

export default authRouter;
