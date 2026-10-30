import crypto from "crypto";
import { userRepository } from "@/repositories/user-repository";
import { tokenRepository } from "@/repositories/token-repository";
import { sendEmail } from "@/utils/mailer";
import { ENV } from "@/config/env";

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function sendVerificationEmailService({ email }: { email: string }) {
    const user = await userRepository.findByEmail(email);

    // Generic response to avoid user enumeration
    if (!user) {
        return {
            code: 200,
            status: "success",
            message: "If the email exists, a verification token has been generated.",
        };
    }

    if (user.emailVerified) {
        return {
            code: 200,
            status: "success",
            message: "Email is already verified.",
        };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS).toISOString();

    // Revoke any previous active verification tokens for this user
    await tokenRepository.revokeActiveTokensByUserAndType(user.id, "EMAIL_VERIFY");

    // Save hashed token
    await tokenRepository.create({
        type: "EMAIL_VERIFY",
        token: tokenHash,
        expiresAt,
        userId: user.id,
    });

    // Deliver verification token (pure text/code, no frontend URLs)
    await sendEmail({
        to: email,
        subject: `Verification Token - ${ENV.APP_NAME}`,
        html: `<p>Your verification token is: <strong>${token}</strong></p><p>This token expires in 24 hours.</p>`,
        text: `Your verification token is: ${token}\n\nThis token expires in 24 hours.`,
    });

    return {
        code: 200,
        status: "success",
        message: "If the email exists, a verification token has been sent.",
        token,
    };
}

export async function verifyEmailService(token: string) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await tokenRepository.findByToken(tokenHash);

    if (
        !tokenRecord ||
        tokenRecord.type !== "EMAIL_VERIFY" ||
        new Date(tokenRecord.expiresAt) < new Date() ||
        tokenRecord.consumedAt ||
        tokenRecord.revokedAt
    ) {
        return {
            code: 400,
            status: "error",
            message: "Invalid or expired verification token.",
        };
    }

    await userRepository.setEmailVerified(tokenRecord.userId, true);
    await tokenRepository.markConsumed(tokenRecord.id);

    return {
        code: 200,
        status: "success",
        message: "Email verified successfully.",
    };
}

export async function resendVerificationEmailService({ email }: { email: string }) {
    return sendVerificationEmailService({ email });
}
