import crypto from "crypto";
import { userRepository } from "@/repositories/user-repository";
import { tokenRepository } from "@/repositories/token-repository";
import { sendEmail } from "@/utils/mailer";

const VERIFICATION_CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Helper to generate a 5-digit numeric verification code (10000 - 99999)
function generate5DigitCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function sendVerificationEmailService({ email, name }: { email: string; name?: string }) {
    const user = await userRepository.findByEmail(email);

    // Generic response to avoid user enumeration
    if (!user) {
        return {
            code: 200,
            status: "success",
            message: "A verification code has been sent to your email address.",
        };
    }

    if (user.emailVerified) {
        return {
            code: 200,
            status: "success",
            message: "Email is already verified.",
        };
    }

    // Determine recipient display name
    const recipientName = name || user.name || "there";

    // 5-digit verification code
    const code = generate5DigitCode();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS).toISOString();

    // Revoke any previous active verification codes for this user
    await tokenRepository.revokeActiveTokensByUserAndType(user.id, "EMAIL_VERIFY");

    // Save hashed code
    await tokenRepository.create({
        type: "EMAIL_VERIFY",
        token: codeHash,
        expiresAt,
        userId: user.id,
    });

    // Clean modern HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Rootine account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7f4; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04); overflow: hidden; border: 1px solid #e5ebe5;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #1B7F4E 0%, #34d399 100%);"></td>
          </tr>

          <!-- Header / Brand -->
          <tr>
            <td style="padding: 36px 36px 12px 36px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td style="width: 48px; height: 48px; background-color: #e8f5ed; border-radius: 14px; text-align: center; vertical-align: middle;">
                    <!-- Plant seedling SVG icon -->
                    <span style="font-size: 26px; line-height: 48px;">🌱</span>
                  </td>
                  <td style="padding-left: 12px; font-size: 24px; font-weight: 800; color: #1B7F4E; letter-spacing: -0.5px;">
                    Rootine
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 12px 36px 32px 36px; text-align: center;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #1a231d; letter-spacing: -0.3px;">
                Verify your email address
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #526056;">
                Hello <strong style="color: #1a231d;">${recipientName}</strong>, thank you for joining Rootine! Use the 5-digit verification code below to complete your registration:
              </p>

              <!-- 5-Digit Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px auto;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #f0f7f2; border: 2px dashed #b7dcc4; border-radius: 16px; padding: 18px 36px;">
                      <span style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #1B7F4E; font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; margin-left: 12px;">
                        ${code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <div style="background-color: #fff9eb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 500;">
                  ⏱️ This verification code expires in <strong>10 minutes</strong>.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #849387;">
                If you did not request this email, you can safely ignore it. Someone may have entered your email by mistake.
              </p>
            </td>
          </tr>

          <!-- Footer -->
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

    const emailText = `Hello ${recipientName},\n\nThank you for signing up for Rootine!\n\nYour 5-digit verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not sign up for Rootine, please ignore this email.`;

    await sendEmail({
        to: email,
        subject: `Your Verification Code: ${code} - Rootine`,
        html: emailHtml,
        text: emailText,
    });

    return {
        code: 200,
        status: "success",
        message: "A verification code has been sent to your email address.",
        verificationCode: code,
    };
}

export async function verifyEmailService(codeOrToken: string) {
    const codeHash = crypto.createHash("sha256").update(codeOrToken.trim()).digest("hex");
    const tokenRecord = await tokenRepository.findByToken(codeHash);

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
            message: "Invalid or expired verification code.",
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
