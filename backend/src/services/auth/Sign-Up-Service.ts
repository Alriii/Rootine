// Purpose: Coordinate the business steps for creating a new account.
import bcrypt from "bcrypt";
import type { RegisterInput } from "@/schema/auth-schema";
import { UserRepository } from "@/repositories/user-repository";

// Purpose: Check for an existing email, hash the password, and ask the repository to create the account.
// Meaning: The input type comes from the same Zod rules used to validate registration requests.
export async function signUpService(input: RegisterInput) {

    // Meaning: Unpack the submitted fields so they can be used by name below.
    const { name, email, password, phoneNumber, countryCode, city } = input;

    // Purpose: Use the repository for user-related database operations.
    const userRepository = new UserRepository();

    // Purpose: Avoid creating another account when this email is already in use.
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        // Meaning: Return early so hashing and account creation do not happen for this duplicate.
        return { code: 400, status: "error", message: "Email already exists" };
    }

    // Purpose: Hash the submitted password before storing it; 12 is bcrypt's work factor.
    const passwordHash = await bcrypt.hash(password, 12);

    // Purpose: Send account fields and the password hash to the repository for insertion.
    const newUser = await userRepository.create({
        name,
        email,
        passwordHash,
        phoneNumber,
        countryCode,
        city,
    });

    // Purpose: Return the service result to the controller; the repository returns only the new ID.
    return {
        code: 201,
        status: "success",
        message: "Account created successfully.",
        data: { user: newUser },
    };
}