import type { Request, Response, NextFunction } from "express";
import { ENV } from "@/config/env";

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error("Unhandled Error:", err);

    const statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
    const response: { status: string; message: string; stack?: string } = {
        status: "error",
        message: err.message || "An internal server error occurred",
    };

    if (ENV.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
}

