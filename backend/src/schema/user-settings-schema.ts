// Purpose: Define validation rules and TypeScript types for user settings endpoints.
import { z } from "zod";

// Shared password field reused in change-password validation
const passwordField = z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        { message: "Password must contain uppercase, lowercase, number, and special character" }
    );

// ------------------------------------------------------------------
// PATCH /users/me  — update profile fields (all optional, at least one required)
// ------------------------------------------------------------------
export const updateProfileSchema = z.object({
    body: z
        .object({
            name: z
                .string()
                .min(3, { message: "Name must be at least 3 characters" })
                .optional(),
            phoneNumber: z
                .string()
                .min(5, { message: "Phone number seems too short" })
                .optional(),
            countryCode: z
                .string()
                .min(1, { message: "Country code is required" })
                .optional(),
            city: z
                .string()
                .regex(/^[A-Za-z\s]+$/, { message: "City must only contain letters and spaces" })
                .regex(/^[A-Z][a-zA-Z\s]*$/, { message: "City must start with a capital letter" })
                .optional(),
            country: z
                .string()
                .optional(),
            zipCode: z
                .string()
                .optional(),
            timezone: z
                .string()
                .min(1, { message: "Timezone is required" })
                .optional(),
        })
        .refine(
            (data) => Object.keys(data).length > 0,
            { message: "At least one field must be provided to update" }
        ),
});

// ------------------------------------------------------------------
// PATCH /users/me/email  — request email change (sends verification)
// ------------------------------------------------------------------
export const changeEmailSchema = z.object({
    body: z.object({
        newEmail: z
            .string({ message: "New email is required" })
            .email({ message: "New email must be a valid email address" }),
    }),
});

// ------------------------------------------------------------------
// POST /users/me/email/verify  — confirm the new email with the token
// ------------------------------------------------------------------
export const verifyNewEmailSchema = z.object({
    body: z.object({
        token: z.string({ message: "Verification token is required" }),
    }),
});

// ------------------------------------------------------------------
// PATCH /users/me/password  — change password (requires current pass)
// ------------------------------------------------------------------
export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string({ message: "Current password is required" }).min(1),
        newPassword: passwordField,
    }),
});

// ------------------------------------------------------------------
// TypeScript types inferred from schemas
// ------------------------------------------------------------------
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>["body"];
export type VerifyNewEmailInput = z.infer<typeof verifyNewEmailSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];

