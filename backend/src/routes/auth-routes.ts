// Purpose: Define the URL and HTTP method for authentication endpoints.
import { Router } from "express";
import { register } from "@/controllers/auth-controllers";
import { registerSchema } from "@/schema/auth-schema";
import { validate } from "@/middlewares/schema-middleware";


// Meaning: Create a router to group authentication endpoints together.
const authRouter = Router();

// Purpose: Handle POST /auth/register by validating the body first and then calling the controller.
// Meaning: app.ts adds the /auth prefix; validate runs before register because handlers are ordered.
authRouter.post("/register", validate(registerSchema), register);

// Purpose: Make this router available for app.ts to mount.
export default authRouter;