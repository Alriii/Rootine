// Purpose: Load environment variables from the backend .env file into process.env.
import dotenv from "dotenv";
dotenv.config();

// Purpose: Fail fast at startup if a critical environment variable is missing.
// Meaning: Like a car that won't start if there's no fuel — better to know immediately
//          than to crash mysteriously later.
function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}. Add it to your .env file.`);
    }
    return value;
}

// Purpose: Collect application settings in one object for the rest of the backend to use.
export const ENV = {
    APP_NAME: process.env.APP_NAME || "Rootine",
    PORT: parseInt(process.env.PORT || "7000", 10),
    NODE_ENV: process.env.NODE_ENV || "development",

    // Fix #4: JWT_SECRET is now required — no silent fallback to a weak default.
    JWT_SECRET: requireEnv("JWT_SECRET"),

    DATABASE_URL: requireEnv("DATABASE_URL"),
    CSRF_SECRET: process.env.CSRF_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM || "no-reply@rootine.app",

    // CORS: allowed origin for the frontend client. Vite runs on 5173, Next/standard react on 3000.
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};
