import bcrypt from "bcrypt";    
import type { RegisterInput } from "@/schema/auth-schema";
import { UserRepository } from "@/repositories/user-repository";

export async function signUpService(input: RegisterInput) {

    const { name, email, password, phoneNumber, countryCode, city } = input;
    const userRepository = new UserRepository();
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
    return { code: 400, status: "error", message: "Email already exists" };
    }
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await userRepository.create({
    name,
    email,
    passwordHash,
    phoneNumber,
    countryCode,
    city,
    });

    return {
    code: 201,
    status: "success",
    message: "Account created successfully.",
    data: { user: newUser },
    };
}