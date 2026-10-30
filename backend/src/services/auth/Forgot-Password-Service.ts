import crypto from "crypto";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { tokens, users, tokenType } from "@/db/schema";
import { tokenRepository } from "@/repositories/token-repository";
import { UserRepository } from "@/repositories/user-repository";
import { ENV } from "@/config/env";
import bcrypt from "bcrypt";

// 10 minutes in milliseconds
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000;

export async function forgotPasswordService({ email }: { email: string }) {
    // Purpose: Find the user by email.
    const userRepository = new UserRepository();
    const user = await userRepository.findByEmail(email);

    if (!user) {
        return { code: 200, status: "success", message: "If the email exists, a reset link has been sent." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString();
    await db
    .update(tokens)
    .set({ revokedAt: new Date().toISOString() })
    .where(and(eq(tokens.userId, user.id), eq(tokens.type, "PASSWORD_RESET"), isNull(tokens.consumedAt), isNull(tokens.revokedAt)));

    await tokenRepository.create({
        type: "PASSWORD_RESET",
        token: tokenHash,
        expiresAt,
        userId: user.id,
    });

    return { code: 200, status: "success", message: "If the email exists, a reset link has been sent.", token };
}

export async function resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await tokenRepository.findByToken(tokenHash);

    if (!tokenRecord || tokenRecord.type !== "PASSWORD_RESET" || new Date(tokenRecord.expiresAt) < new Date() || tokenRecord.consumedAt || tokenRecord.revokedAt) {
        return { code: 400, status: "error", message: "Invalid or expired token." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, tokenRecord.userId));
    await tokenRepository.markConsumed(tokenRecord.id);

    return { code: 200, status: "success", message: "Password has been reset successfully." };
        
}
