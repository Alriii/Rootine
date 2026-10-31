// Purpose: Handle HTTP requests for user settings endpoints and return structured responses.
import type { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { userRepository } from "@/repositories/user-repository";
import {
    updateProfileService,
    changeEmailService,
    verifyNewEmailService,
    changePasswordService,
} from "@/services/user/user-settings-service";

// GET /users/me — return the current user's full profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const user = await userRepository.findById(req.user.userId);
    if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
    }

    return res.status(200).json({ status: "success", data: { user } });
});

// PATCH /users/me — update editable profile fields
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const result = await updateProfileService(req.user.userId, req.body);
    return res.status(result.code).json(result);
});

// PATCH /users/me/email — initiate email change
export const changeEmail = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const { newEmail } = req.body as { newEmail: string };
    const result = await changeEmailService(req.user.userId, newEmail);
    return res.status(result.code).json(result);
});

// POST /users/me/email/verify — confirm new email with token
export const verifyNewEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body as { token: string };
    const result = await verifyNewEmailService(token);
    return res.status(result.code).json(result);
});

// PATCH /users/me/password — change password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body as {
        currentPassword: string;
        newPassword: string;
    };

    const result = await changePasswordService(req.user.userId, currentPassword, newPassword);
    return res.status(result.code).json(result);
});
