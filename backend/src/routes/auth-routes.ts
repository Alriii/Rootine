import { Router } from "express";
import { register } from "@/controllers/auth-controllers";
import { registerSchema } from "@/schema/auth-schema";
import { validate } from "@/middlewares/schema-middleware";

const authRouter = Router();
authRouter.post("/register", validate(registerSchema), register);

export default authRouter;