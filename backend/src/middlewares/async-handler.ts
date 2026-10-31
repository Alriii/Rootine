// Purpose: Wrap async controller functions to catch any unhandled errors and pass them
//          to Express's centralized error handler automatically.
// Meaning: Like a safety net under a trapeze artist — if something unexpected goes wrong,
//          it catches the fall cleanly instead of crashing the whole show.
import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: AsyncHandler): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

