import crypto from "crypto";
import bcrypt from "bcrypt";
import { tokenRepository } from "@/repositories/token-repository";
import { userRepository } from "@/repositories/user-repository";
import { sendEmail } from "@/utils/mailer";
import { ENV } from "@/config/env";

// 10 minutes in milliseconds
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000;

// 5-digit reset code
function generate5DigitResetCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function forgotPasswordService({ email }: { email: string }) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        return {
            code: 200,
            status: "success",
            message: "If the email exists, a reset code has been sent.",
        };
    }

    const code = generate5DigitResetCode();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString();

    // Revoke previous active reset tokens for this user
    await tokenRepository.revokeActiveTokensByUserAndType(user.id, "PASSWORD_RESET");

    await tokenRepository.create({
        type: "PASSWORD_RESET",
        token: codeHash,
        expiresAt,
        userId: user.id,
    });

    const recipientName = user.name || "there";

    // Clean modern HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Rootine password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7f4; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e5ebe5;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #1B7F4E 0%, #34d399 100%);"></td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 12px 36px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td style="width: 48px; height: 48px; background-color: #e8f5ed; border-radius: 14px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 26px; line-height: 48px;">🔑</span>
                  </td>
                  <td style="padding-left: 12px; font-size: 24px; font-weight: 800; color: #1B7F4E;">
                    Rootine
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 36px 32px 36px; text-align: center;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #1a231d;">
                Password Reset Code
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #526056;">
                Hello <strong style="color: #1a231d;">${recipientName}</strong>, use the 5-digit code below to reset your Rootine account password:
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px auto;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #f0f7f2; border: 2px dashed #b7dcc4; border-radius: 16px; padding: 18px 36px;">
                      <span style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #1B7F4E; font-family: monospace; margin-left: 12px;">
                        ${code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fff9eb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 500;">
                  ⏱️ This reset code expires in <strong>10 minutes</strong>.
                </p>
              </div>
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #849387;">
                If you did not request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fbfdfb; border-top: 1px solid #edf2ed; padding: 20px 36px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #98a79b;">
                © 2026 Rootine. Build routines that support the life you want.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailText = `Hello ${recipientName},\n\nYour 5-digit password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request a password reset, please ignore this message.`;

    await sendEmail({
        to: email,
        subject: `Your Password Reset Code: ${code} - ${ENV.APP_NAME}`,
        html: emailHtml,
        text: emailText,
    });

    return {
        code: 200,
        status: "success",
        message: "If the email exists, a reset code has been sent to your email.",
        resetCode: code,
    };
}

export async function resetPassword(codeOrToken: string, newPassword: string) {
    const codeHash = crypto.createHash("sha256").update(codeOrToken.trim()).digest("hex");
    const tokenRecord = await tokenRepository.findByToken(codeHash);

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
            message: "Invalid or expired reset code.",
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
