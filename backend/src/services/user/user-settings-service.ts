// Purpose: Business logic for all user-settings actions (profile, email, password).
import crypto from "crypto";
import bcrypt from "bcrypt";
import { userSettingsRepository } from "@/repositories/user-settings-repository";
import { tokenRepository } from "@/repositories/token-repository";
import { sendEmail } from "@/utils/mailer";
import { ENV } from "@/config/env";
import type { ProfileUpdateData } from "@/repositories/user-settings-repository";

const EMAIL_CHANGE_TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// ------------------------------------------------------------------
// Update profile fields (name, phone, country, city, timezone)
// Analogy: Like updating your contact card — only the fields you hand
//          over get changed; the rest stay the same.
// ------------------------------------------------------------------
export async function updateProfileService(userId: string, data: ProfileUpdateData) {
    const updated = await userSettingsRepository.updateProfile(userId, data);

    if (!updated) {
        return { code: 404, status: "error", message: "User not found." };
    }

    return {
        code: 200,
        status: "success",
        message: "Profile updated successfully.",
        data: { user: updated },
    };
}

// ------------------------------------------------------------------
// Request email change — sends a verification token to the NEW email.
// Analogy: Like asking the post office to forward mail to a new address;
//          they first send a confirmation letter there before switching.
// ------------------------------------------------------------------
export async function changeEmailService(userId: string, newEmail: string) {
    // Block if new email is already registered to another account
    const taken = await userSettingsRepository.emailExists(newEmail);
    if (taken) {
        return { code: 409, status: "error", message: "This email is already in use." };
    }

    // Generate a secure one-time token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + EMAIL_CHANGE_TOKEN_EXPIRY_MS).toISOString();

    // Encode the intended new email inside the token value itself.
    // Format: <rawToken>|<newEmail>  — the verify step splits on "|" to get both parts.
    const compositeToken = `${rawToken}|${newEmail}`;
    const compositeHash = crypto.createHash("sha256").update(compositeToken).digest("hex");

    // Revoke any previous pending email-change tokens for this user
    await tokenRepository.revokeActiveTokensByUserAndType(userId, "EMAIL_VERIFY");

    await tokenRepository.create({
        type: "EMAIL_VERIFY",
        token: compositeHash,
        expiresAt,
        userId,
    });

    await sendEmail({
        to: newEmail,
        subject: `Confirm your new email — ${ENV.APP_NAME}`,
        html: `<p>Your email-change verification token is: <strong>${compositeToken}</strong></p><p>This token expires in 10 minutes.</p>`,
        text: `Your email-change token is: ${compositeToken}\n\nThis token expires in 10 minutes.`,
    });

    return {
        code: 200,
        status: "success",
        message: "A verification token has been sent to your new email address.",
    };
}

// ------------------------------------------------------------------
// Verify new email — consumes the token and applies the email change.
// Analogy: The confirmation letter was signed and returned; the address
//          book is now officially updated.
// ------------------------------------------------------------------
export async function verifyNewEmailService(token: string) {
    // Token format: <rawToken>|<newEmail>
    const pipeIndex = token.indexOf("|");
    if (pipeIndex === -1) {
        return { code: 400, status: "error", message: "Invalid token format." };
    }

    const compositeHash = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await tokenRepository.findByToken(compositeHash);

    if (
        !tokenRecord ||
        tokenRecord.type !== "EMAIL_VERIFY" ||
        new Date(tokenRecord.expiresAt) < new Date() ||
        tokenRecord.consumedAt ||
        tokenRecord.revokedAt
    ) {
        return { code: 400, status: "error", message: "Invalid or expired token." };
    }

    const newEmail = token.substring(pipeIndex + 1);
    await userSettingsRepository.updateEmail(tokenRecord.userId, newEmail);
    await tokenRepository.markConsumed(tokenRecord.id);

    return {
        code: 200,
        status: "success",
        message: "Email address updated successfully. Please log in with your new email.",
    };
}

// ------------------------------------------------------------------
// Change password — verifies the current password before updating.
// Analogy: Like changing a lock — you must prove you own the old key
//          before you receive the new one.
// ------------------------------------------------------------------
export async function changePasswordService(
    userId: string,
    currentPassword: string,
    newPassword: string,
) {
    const storedHash = await userSettingsRepository.getPasswordHash(userId);
    if (!storedHash) {
        return { code: 404, status: "error", message: "User not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, storedHash);
    if (!isMatch) {
        return { code: 401, status: "error", message: "Current password is incorrect." };
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await userSettingsRepository.updatePassword(userId, newHash);

    return {
        code: 200,
        status: "success",
        message: "Password changed successfully.",
    };
}
