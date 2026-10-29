// Purpose: Translate the HTTP registration request into a service call and HTTP response.
import type { Request, Response } from "express";
import { signUpService } from "@/services/auth/Sign-Up-Service";


// Meaning: req contains the incoming request; res is used to send the answer.
export async function register(req: Request, res: Response) {

    // Purpose: Pass the already-validated request body to the signup business logic.
    const result = await signUpService(req.body);

    // Purpose: Use the service's status code and send its result as JSON to the client.
    return res.status(result.code).json(result);
}