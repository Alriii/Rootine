// Purpose: Define the URL and HTTP method for authentication endpoints.
import { Router } from "express";
import { validate } from "@/middlewares/schema-middleware";
import { register, login, passwordReset, forgotPassword } from "@/controllers/auth-controllers";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "@/schema/auth-schema";


// Meaning: Create a router to group authentication endpoints together.
const authRouter = Router();

// Purpose: Handle POST /auth/register by validating the body first and then calling the controller.
// Meaning: app.ts adds the /auth prefix; validate runs before register because handlers are ordered.
authRouter.post("/register", validate(registerSchema), register);

// Purpose: Handle POST /auth/login by validating the body first and then calling the controller.
authRouter.post("/login", validate(loginSchema), login);

authRouter.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", validate(resetPasswordSchema), passwordReset);

// Purpose: Make this router available for app.ts to mount.
export default authRouter;