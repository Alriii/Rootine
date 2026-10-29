// Purpose: Set up the Express application and connect its routes.
import express from "express";
import authRouter from "@/routes/auth-routes";

// Meaning: Create the application that will receive HTTP requests.
const app = express();

// Purpose: Convert incoming JSON request bodies into JavaScript values on req.body.
app.use(express.json());

// Meaning: Mount authentication endpoints under /auth, such as /auth/register.
app.use("/auth", authRouter);

// Purpose: Let server.ts start this configured application.
export default app;