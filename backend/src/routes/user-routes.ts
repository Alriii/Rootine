// Purpose: Define the URL paths and HTTP methods for all user-settings endpoints.
import { Router } from "express";
import { validate } from "@/middlewares/schema-middleware";
import { requireAuth } from "@/middlewares/auth-middleware";
import {
    getProfile,
    updateProfile,
    changeEmail,
    verifyNewEmail,
    changePassword,
} from "@/controllers/user-controller";
import {
    updateProfileSchema,
    changeEmailSchema,
    verifyNewEmailSchema,
    changePasswordSchema,
} from "@/schema/user-settings-schema";

const userRouter = Router();

// All routes below require a valid access token
userRouter.use(requireAuth);

// GET  /users/me              — fetch current user profile
userRouter.get("/me", getProfile);

// PATCH /users/me             — update profile (name, phone, country, city, timezone)
userRouter.patch("/me", validate(updateProfileSchema), updateProfile);

// PATCH /users/me/email       — request email change (sends token to new address)
userRouter.patch("/me/email", validate(changeEmailSchema), changeEmail);

// POST  /users/me/email/verify — confirm new email using the token
userRouter.post("/me/email/verify", validate(verifyNewEmailSchema), verifyNewEmail);

// PATCH /users/me/password    — change password (current password required)
userRouter.patch("/me/password", validate(changePasswordSchema), changePassword);

export default userRouter;

