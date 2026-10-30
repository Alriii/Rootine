// Purpose: Load environment variables from the backend .env file into process.env.
import dotenv from 'dotenv';
dotenv.config();

// Purpose: Collect application settings in one object for the rest of the backend to use.
export const ENV = {
    APP_NAME: process.env.APP_NAME || 'Rootine API',
    PORT: parseInt(process.env.PORT || '7000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_me',
    DATABASE_URL: process.env.DATABASE_URL,
    CSRF_SECRET: process.env.CSRF_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@rootine.app',
};
