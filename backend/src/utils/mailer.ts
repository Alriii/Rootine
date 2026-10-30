import nodemailer from "nodemailer";
import { ENV } from "@/config/env";

export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

// Purpose: Configure the nodemailer transport using Google SMTP / Gmail or standard SMTP
function createTransporter() {
    if (!ENV.SMTP_USER || !ENV.SMTP_PASS) {
        return null;
    }

    // Google SMTP / Gmail configuration
    if (ENV.SMTP_HOST === "smtp.gmail.com" || ENV.SMTP_USER.endsWith("@gmail.com")) {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: ENV.SMTP_USER,
                pass: ENV.SMTP_PASS,
            },
        });
    }

    // Generic SMTP configuration
    return nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_PORT === 465,
        auth: {
            user: ENV.SMTP_USER,
            pass: ENV.SMTP_PASS,
        },
    });
}

const transporter = createTransporter();

// Purpose: Send an email, or log it cleanly to the console when SMTP is not configured
export async function sendEmail({ to, subject, html, text }: SendMailOptions) {
    if (transporter) {
        return await transporter.sendMail({
            from: `"${ENV.APP_NAME}" <${ENV.EMAIL_FROM}>`,
            to,
            subject,
            html,
            text,
        });
    }

    // Fallback log when credentials are not configured
    console.log(`\n================== [EMAIL SIMULATION (${ENV.NODE_ENV})] ==================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${text || html}`);
    console.log(`========================================================================\n`);

    return { messageId: "dev-simulated-id" };
}
