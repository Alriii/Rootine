import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { LoginInput } from "@/schema/auth-schema";
import { userRepository } from "@/repositories/user-repository";
import { tokenRepository } from "@/repositories/token-repository";
import { ENV } from "@/config/env";

const ACCESS_TOKEN_EXPIRY_SECONDS = 600; // 10 minutes

export async function loginService(input: LoginInput) {
    const { email, password } = input;

    const user = await userRepository.findCredentialsByEmail(email);
    if (!user) {
        return { code: 401, status: "error", message: "Invalid email or password" };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return { code: 401, status: "error", message: "Invalid email or password" };
    }

    // Fix #2: Block unverified accounts from logging in.
    // Meaning: Like a club — you signed up but must confirm your invite before entering.
    if (!user.emailVerified) {
        return {
            code: 403,
            status: "error",
            message: "Please verify your email address before logging in. Check your inbox for the verification token.",
        };
    }

    const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS });
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await tokenRepository.create({
        type: "REFRESH",
        token: refreshTokenHash,
        expiresAt: refreshExpiresAt,
        userId: user.id,
    });

    return {
        code: 200,
        status: "success",
        message: "Login successful",
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified,
            },
            token,
            // Fix #3 hint: Tell the client exactly when the access token expires
            // so it can silently refresh before the user notices.
            expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
            refreshToken,
        },
    };
}
