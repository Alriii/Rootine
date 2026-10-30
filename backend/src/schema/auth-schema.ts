// Purpose: Define runtime validation rules and TypeScript input types for authentication requests.
import { z } from "zod";

// Meaning: z is Zod's toolbox; z.object and z.string describe the shape and rules of real incoming data.
export const registerSchema = z.object({
    body: z.object({
        name: z
        .string({ message: "Name is required" })
        .min(3, { message: "Name must be at least 3 characters" }),
        email: z.email({
            message: "Email is required and must be a valid email address",
        }),
        password: z
        .string({ message: "Password is required" })
        .min(10, { message: "Password must be at least 10 characters" }),
        phoneNumber: z.string({ message: "Phone number is required" }),
        countryCode: z.string({ message: "Country code is required" }),
        city: z.string({ message: "City is required" })
        .regex(/^[A-Za-z\s]+$/, { message: "City must only contain letters and spaces" })
        .regex(/^[A-Z][a-zA-Z\s]*$/, { message: "City must start with a capital letter" })
    }),
});

// Purpose: Require an email-shaped value and a password of at least 10 characters for login.
// Meaning: This checks submitted input; it does not authenticate the user or compare the password.
export const loginSchema = z.object({
    body: z.object({
        email: z.string({ message: "Invalid Email format" })
        .email({ message: "Email must be a valid email address" }),
        password: z.string()
        .min(1,{ message: "Password is required" })
        .min(10, { message: "Password must be at least 10 characters" }),
    }),
}); 

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string({ message: "Invalid Email format" })
        .email({ message: "Email must be a valid email address" }),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string({ message: "Token is required" }),
        newPassword: z.string({ message: "New password is required" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" })
        .min(8, { message: "New password must be at least 8 characters" }),
    }),
});

// Purpose: Describe the optional refreshToken request-body field for a future refresh endpoint.
// Meaning: The schema exists, but the refresh-token flow is not connected yet.
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
    .optional(),
  }),
});

// Purpose: Derive compile-time TypeScript types from the schemas so field definitions are not duplicated.
// Meaning: z.infer gets the whole schema type; ["body"] selects the inner request body fields.
export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];