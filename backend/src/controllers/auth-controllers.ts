import type { Request, Response } from "express";
import { signUpService } from "@/services/auth/Sign-Up-Service";


export async function register(req: Request, res: Response) {

    const result = await signUpService(req.body);
    return res.status(result.code).json(result);
}