// Purpose: Keep database queries for the users table separate from signup/login business logic.
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

// Meaning: Each method below performs one database operation for an account.
export class UserRepository {
    // Purpose: Check whether an account uses this email; only its ID is needed for the existence check.
    async findByEmail(email: string) {
    const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));
    return user;
  }

    // Purpose: Insert a new account and return only its generated ID.
    // Meaning: The inferred insert type keeps the allowed fields aligned with the Drizzle users table.
    async create(data: typeof users.$inferInsert) {
        const [newUser] = await db
            .insert(users)
            .values(data)
            .returning({ id: users.id });

        return newUser;
    }

    // Purpose: Load the private credentials the login service needs for password comparison.
    // Meaning: Never send passwordHash in an API response; it is only for backend verification.
    async findCredentialsByEmail(email: string) {
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                passwordHash: users.passwordHash,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        // Meaning: Return the matching credentials, or undefined when no account matches.
        return user;
    }
}