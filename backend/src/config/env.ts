// Purpose: Load environment variables from the backend .env file into process.env.
import dotenv from 'dotenv';
dotenv.config();

// Purpose: Collect application settings in one object for the rest of the backend to use.
export const ENV = {
    // Meaning: Use environment-provided values, with development defaults where provided.
    APP_NAME: process.env.APP_NAME || 'Portfolio API',
    PORT: parseInt(process.env.PORT || '7000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    // Warning: Replace the fallback with a strong secret in real deployments.
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_me',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
    // Meaning: DATABASE_URL is required by db/index.ts; CSRF_SECRET is reserved for CSRF protection.
    DATABASE_URL: process.env.DATABASE_URL,
    CSRF_SECRET: process.env.CSRF_SECRET,
};