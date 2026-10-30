// Purpose: Translate HTTP authentication requests into service calls and HTTP responses.
import type { Request, Response } from "express";
import { signUpService } from "@/services/auth/Sign-Up-Service";
import { loginService } from "@/services/auth/Log-In-Service";
import { forgotPasswordService, resetPassword } from "@/services/auth/Forgot-Password-Service";
import { refreshTokenService, logoutService } from "@/services/auth/Refresh-Token-Service";
import { verifyEmailService, resendVerificationEmailService } from "@/services/auth/Email-Verification-Service";
import { userRepository } from "@/repositories/user-repository";

export async function register(req: Request, res: Response) {
    const result = await signUpService(req.body);
    return res.status(result.code).json(result);
}

export async function login(req: Request, res: Response) {
    const result = await loginService(req.body);
    return res.status(result.code).json(result);
}

export async function forgotPassword(req: Request, res: Response) {
    const result = await forgotPasswordService(req.body);
    return res.status(result.code).json(result);
}

export async function passwordReset(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    const result = await resetPassword(token, newPassword);
    return res.status(result.code).json(result);
}

export async function refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const result = await refreshTokenService(refreshToken);
    return res.status(result.code).json(result);
}

export async function logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const result = await logoutService(refreshToken);
    return res.status(result.code).json(result);
}

export async function verifyEmail(req: Request, res: Response) {
    const { token } = req.body;
    const result = await verifyEmailService(token);
    return res.status(result.code).json(result);
}

export async function resendVerification(req: Request, res: Response) {
    const result = await resendVerificationEmailService(req.body);
    return res.status(result.code).json(result);
}

export async function getMe(req: Request, res: Response) {
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
}
