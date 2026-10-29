import type { RequestHandler } from "express";
import { z } from "zod";

export function validate(schema: z.ZodType): RequestHandler { 
    return (req, res, next) => {
    const validationResult = schema.safeParse({ body: req.body });

    if (!validationResult.success) {
    return res.status(400).json({
    status: "error",
    message: "Invalid request data",
    errors: validationResult.error.issues,
  });
}
 next();

};
}