// Purpose: Translate HTTP authentication requests into service calls and HTTP responses.
import type { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { signUpService } from "@/services/auth/Sign-Up-Service";
import { loginService } from "@/services/auth/Log-In-Service";
import { forgotPasswordService, resetPassword } from "@/services/auth/Forgot-Password-Service";
import { refreshTokenService, logoutService } from "@/services/auth/Refresh-Token-Service";
import { verifyEmailService, resendVerificationEmailService } from "@/services/auth/Email-Verification-Service";
import { userRepository } from "@/repositories/user-repository";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await signUpService(req.body);
    return res.status(Number(result.code)).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await loginService(req.body);
    return res.status(Number(result.code)).json(result);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await forgotPasswordService(req.body);
    return res.status(Number(result.code)).json(result);
});

export const passwordReset = asyncHandler(async (req: Request, res: Response) => {
    const token = (req.body.code || req.body.token) as string;
    const { newPassword } = req.body;
    const result = await resetPassword(token, newPassword);
    return res.status(Number(result.code)).json(result);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken: rt } = req.body;
    const result = await refreshTokenService(rt);
    return res.status(Number(result.code)).json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken: rt } = req.body;
    const result = await logoutService(rt);
    return res.status(Number(result.code)).json(result);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const code = (req.body.code || req.body.token) as string;
    const result = await verifyEmailService(code);
    return res.status(Number(result.code)).json(result);
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const result = await resendVerificationEmailService(req.body);
    return res.status(Number(result.code)).json(result);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const user = await userRepository.findById(req.user.userId);
    if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
    }

    return res.status(200).json({
        status: "success",
        data: { user },
    });
});
