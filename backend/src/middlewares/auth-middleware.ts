import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "@/config/env";

export interface AuthenticatedUser {
    userId: string;
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}
/* eslint-enable @typescript-eslint/no-namespace */

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "error",
            message: "Unauthorized. Missing or malformed authentication token.",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
        req.user = { userId: decoded.userId };
        return next();
    } catch {
        return res.status(401).json({
            status: "error",
            message: "Unauthorized. Token is invalid or expired.",
        });
    }
}
