// Purpose: Set up the Express application, security middleware, and connect routes.
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import authRouter from "@/routes/auth-routes";
import taskRouter from "@/routes/task-routes";
import { errorHandler } from "@/middlewares/error-middleware";
import { ENV } from "@/config/env";

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS for API clients
app.use(cors());

// Protect against HTTP Parameter Pollution
app.use(hpp());

// Parse cookie headers
app.use(cookieParser());

// Convert incoming JSON request bodies into JavaScript values on req.body
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "success",
        message: `${ENV.APP_NAME} is healthy`,
        timestamp: new Date().toISOString(),
    });
});

// Authentication endpoints
app.use("/auth", authRouter);

// Task management endpoints
app.use("/tasks", taskRouter);

// Centralized error handling
app.use(errorHandler);

export default app;
