import bcrypt from "bcrypt";
import type { LoginInput } from "@/schema/auth-schema";
import { UserRepository } from "@/repositories/user-repository";
import jwt from "jsonwebtoken";
import { ENV } from "@/config/env";
import {tokenRepository} from "@/repositories/token-repository";
import crypto from "crypto";
import { tokens } from "@/db/schema";

export async function loginService(input: LoginInput) {
    const { email, password } = input;

    const userRepository = new UserRepository();

    const user = await userRepository.findCredentialsByEmail(email);
    if (!user) {
        return { code: 401, status: "error", message: "Invalid email or password" };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return { code: 401, status: "error", message: "Invalid email or password" };
    }

    const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET, { expiresIn: "10m" }); // Token expires in 10 minutes

    const refreshToken = crypto.randomBytes(32).toString("hex");

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Refresh token expires in 7 days

    await tokenRepository.create({
        type: "REFRESH",
        token: refreshTokenHash,
        expiresAt: refreshExpiresAt,
        userId: user.id,
    });    
    return { code: 200, status: "success", message: "Login successful", token, refreshToken };
}