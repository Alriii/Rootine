import crypto from "crypto";
import { db } from "@/db";
import { tokens } from "@/db/schema";
import { tokenRepository } from "@/repositories/token-repository";
import jwt from "jsonwebtoken";
import { ENV } from "@/config/env";

export async function refreshTokenService(refreshToken: string) {
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const tokenRecord = await tokenRepository.findByToken(refreshTokenHash);

    if (!tokenRecord || tokenRecord.type !== "REFRESH" || new Date(tokenRecord.expiresAt) < new Date() || tokenRecord.consumedAt || tokenRecord.revokedAt) {
        return { code: 400, status: "error", message: "Invalid or expired refresh token." };
    }

    await tokenRepository.markConsumed(tokenRecord.id);

    
    const newRefreshToken = crypto.randomBytes(32).toString("hex");
    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    const newRefreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    
    await tokenRepository.create({
        type: "REFRESH",
        token: newRefreshTokenHash,
        expiresAt: newRefreshExpiresAt,
        userId: tokenRecord.userId,
    });

    
    const newToken = jwt.sign({ userId: tokenRecord.userId }, ENV.JWT_SECRET, { expiresIn: "10m" });

    
    return { code: 200, status: "success", message: "Token refreshed successfully.", data: { token: newToken, refreshToken: newRefreshToken } };
}