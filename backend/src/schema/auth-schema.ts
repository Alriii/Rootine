import { z } from "zod";

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

export const loginSchema = z.object({
    body: z.object({
        email: z.string({ message: "Invalid Email format" })
        .email({ message: "Email must be a valid email address" }),
        password: z.string()
        .min(1,{ message: "Password is required" })
        .min(10, { message: "Password must be at least 10 characters" }),
    }),
}); 

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];