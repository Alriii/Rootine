import crypto from "crypto";
import bcrypt from "bcrypt";
import { tokenRepository } from "@/repositories/token-repository";
import { userRepository } from "@/repositories/user-repository";
import { sendEmail } from "@/utils/mailer";
import { ENV } from "@/config/env";

// 10 minutes in milliseconds
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000;

export async function forgotPasswordService({ email }: { email: string }) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        return {
            code: 200,
            status: "success",
            message: "If the email exists, a reset token has been sent.",
        };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString();

    // Revoke previous active reset tokens for this user
    await tokenRepository.revokeActiveTokensByUserAndType(user.id, "PASSWORD_RESET");

    await tokenRepository.create({
        type: "PASSWORD_RESET",
        token: tokenHash,
        expiresAt,
        userId: user.id,
    });

    // Deliver reset token (pure text/token, no frontend URLs)
    await sendEmail({
        to: email,
        subject: `Password Reset Token - ${ENV.APP_NAME}`,
        html: `<p>Your password reset token is: <strong>${token}</strong></p><p>This token expires in 10 minutes.</p>`,
        text: `Your password reset token is: ${token}\n\nThis token expires in 10 minutes.`,
    });

    return {
        code: 200,
        status: "success",
        message: "If the email exists, a reset token has been sent.",
        token,
    };
}

export async function resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await tokenRepository.findByToken(tokenHash);

    if (
        !tokenRecord ||
        tokenRecord.type !== "PASSWORD_RESET" ||
        new Date(tokenRecord.expiresAt) < new Date() ||
        tokenRecord.consumedAt ||
        tokenRecord.revokedAt
    ) {
        return {
            code: 400,
            status: "error",
            message: "Invalid or expired token.",
        };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.updatePassword(tokenRecord.userId, passwordHash);
    await tokenRepository.markConsumed(tokenRecord.id);

    return {
        code: 200,
        status: "success",
        message: "Password has been reset successfully.",
    };
}
