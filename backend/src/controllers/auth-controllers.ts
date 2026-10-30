// Purpose: Translate the HTTP registration request into a service call and HTTP response.
import type { Request, Response } from "express";
import { signUpService } from "@/services/auth/Sign-Up-Service";
import { loginService } from "@/services/auth/Log-In-Service";
import { forgotPasswordService } from "@/services/auth/Forgot-Password-Service";
import { resetPassword } from "@/services/auth/Forgot-Password-Service";




// Meaning: req contains the incoming request; res is used to send the answer.
export async function register(req: Request, res: Response) {

    // Purpose: Pass the already-validated request body to the signup business logic.
    const result = await signUpService(req.body);

    // Purpose: Use the service's status code and send its result as JSON to the client.
    return res.status(result.code).json(result);
}

export async function login(req: Request, res: Response) {

    // Purpose: Pass the already-validated request body to the login business logic.
    const result = await loginService(req.body);
    return res.status(result.code).json(result);
}

export async function forgotPassword(req: Request, res: Response) {
    const result = await forgotPasswordService(req.body);
    return res.status(result.code).json(result);
}

export async function passwordReset(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    const result = await resetPassword(token, newPassword);
    return res.status(result.code).json(result);
}
