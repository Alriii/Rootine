// Purpose: Reject request bodies that do not match the provided Zod schema.
import type { RequestHandler } from "express";
import { z } from "zod";

// Meaning: Accept a schema once and return Express middleware that checks each request against it.
export function validate(schema: z.ZodType): RequestHandler {
    return (req, res, next) => {
    // Purpose: Check the request body without throwing when user input is invalid.
    const validationResult = schema.safeParse({ body: req.body });

    // Meaning: Stop here and report the validation issues instead of calling the controller.
    if (!validationResult.success) {
    return res.status(400).json({
    status: "error",
    message: "Invalid request data",
    errors: validationResult.error.issues,
  });
}
// Meaning: Valid data continues to the next handler, which is the controller.
 next();

};
}