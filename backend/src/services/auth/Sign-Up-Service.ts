// Purpose: Coordinate the business steps for creating a new account.
import bcrypt from "bcrypt";
import type { RegisterInput } from "@/schema/auth-schema";
import { userRepository } from "@/repositories/user-repository";
import { sendVerificationEmailService } from "@/services/auth/Email-Verification-Service";

// Purpose: Check for an existing email, hash the password, and ask the repository to create the account.
export async function signUpService(input: RegisterInput) {
    const { name, email, password, phoneNumber, countryCode, city } = input;

    // Avoid creating another account when this email is already in use
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        return { code: 400, status: "error", message: "Email already exists" };
    }

    // Hash password with 12 rounds
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await userRepository.create({
        name,
        email,
        passwordHash,
        phoneNumber: phoneNumber || "0000000000",
        countryCode: countryCode || "PH",
        city: city || "Cebu",
    });

    // Automatically send verification email for newly created accounts (with user's name)
    await sendVerificationEmailService({ email: newUser.email, name: newUser.name });

    return {
        code: 201,
        status: "success",
        message: "Account created successfully. A verification code has been sent to your email.",
        data: { user: newUser },
    };
}
