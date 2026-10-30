// Purpose: Define runtime validation rules and TypeScript input types for authentication requests.
import { z } from "zod";

// Shared password complexity validation
const passwordField = z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        { message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" }
    );

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string({ message: "Name is required" })
            .min(3, { message: "Name must be at least 3 characters" }),
        email: z.string({ message: "Invalid Email format" }).email({
            message: "Email is required and must be a valid email address",
        }),
        password: passwordField,
        phoneNumber: z.string({ message: "Phone number is required" }),
        countryCode: z.string({ message: "Country code is required" }),
        city: z
            .string({ message: "City is required" })
            .regex(/^[A-Za-z\s]+$/, { message: "City must only contain letters and spaces" })
            .regex(/^[A-Z][a-zA-Z\s]*$/, { message: "City must start with a capital letter" }),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string({ message: "Invalid Email format" })
            .email({ message: "Email must be a valid email address" }),
        password: z.string().min(1, { message: "Password is required" }),
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
        newPassword: passwordField,
    }),
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string({ message: "Refresh token is required" }),
    }),
});

export const logoutSchema = z.object({
    body: z.object({
        refreshToken: z.string({ message: "Refresh token is required" }),
    }),
});

export const verifyEmailSchema = z.object({
    body: z.object({
        token: z.string({ message: "Verification token is required" }),
    }),
});

export const resendVerificationSchema = z.object({
    body: z.object({
        email: z.string({ message: "Invalid Email format" })
            .email({ message: "Email must be a valid email address" }),
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
export type LogoutInput = z.infer<typeof logoutSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>["body"];
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>["body"];
