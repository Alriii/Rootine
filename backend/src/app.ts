// Purpose: Set up the Express application, security middleware, and connect routes.
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import { rateLimit } from "express-rate-limit";
import authRouter from "@/routes/auth-routes";
import taskRouter from "@/routes/task-routes";
import userRouter from "@/routes/user-routes";
import { errorHandler } from "@/middlewares/error-middleware";
import { ENV } from "@/config/env";

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS for API clients
// Allows requests from frontend dev servers (5173, 3000) or configured origin
const allowedOrigins = [
    ENV.CORS_ORIGIN,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// Protect against HTTP Parameter Pollution
app.use(hpp());

// Parse cookie headers
app.use(cookieParser());

// Fix #3: Limit request body size to 10 KB to prevent oversized payload attacks.
// Meaning: Like a post office that refuses to accept packages over a certain weight.
app.use(express.json({ limit: "10kb" }));

// Fix #1: Global rate limiter — applies to every route.
// Meaning: Like a bouncer who lets only 300 people through the door every 15 minutes.
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,                  // max 300 requests per IP per window
    standardHeaders: true,     // include RateLimit-* headers in response
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests. Please wait a few minutes and try again.",
    },
});
app.use(globalLimiter);

// Stricter rate limiter for sensitive auth endpoints.
// Only counts FAILED attempts (wrong password, invalid credentials, etc.)
// Successful logins (2xx) do NOT count against the limit.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,       // 15-minute window
    max: 15,                          // block IP after 15 failed attempts
    skipSuccessfulRequests: true,     // ← only failed requests count
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many failed login attempts. Please wait 15 minutes and try again.",
    },
});

// Health check endpoint (exempt from auth rate limit)
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "success",
        message: `${ENV.APP_NAME} is healthy`,
        timestamp: new Date().toISOString(),
    });
});

// Fix #4: All routes versioned under /api/v1 — future-proofs breaking changes.
// Meaning: Like a product with a version number — v1 clients always work, even when v2 arrives.
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/users", userRouter);

// Centralized error handling
app.use(errorHandler);

export default app;
