// Purpose: Keep database queries for the users table separate from signup/login business logic.
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

// Meaning: Each method below performs one database operation for an account.
export class UserRepository {
    // Purpose: Check whether an account uses this email.
    async findByEmail(email: string) {
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                emailVerified: users.emailVerified,
                timezone: users.timezone,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return user || null;
    }

    // Purpose: Find a user by their unique primary ID.
    async findById(id: string) {
        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                phoneNumber: users.phoneNumber,
                countryCode: users.countryCode,
                city: users.city,
                timezone: users.timezone,
                emailVerified: users.emailVerified,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return user || null;
    }

    // Purpose: Insert a new account and return only its generated ID and email.
    async create(data: typeof users.$inferInsert) {
        const [newUser] = await db
            .insert(users)
            .values(data)
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
            });

        return newUser;
    }

    // Purpose: Load the credentials needed for authentication.
    async findCredentialsByEmail(email: string) {
        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                passwordHash: users.passwordHash,
                emailVerified: users.emailVerified,
                timezone: users.timezone,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return user || null;
    }

    // Purpose: Update a user's password hash.
    async updatePassword(id: string, passwordHash: string) {
        const [updatedUser] = await db
            .update(users)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning({ id: users.id });

        return updatedUser;
    }

    // Purpose: Update a user's email verification status.
    async setEmailVerified(id: string, emailVerified = true) {
        const [updatedUser] = await db
            .update(users)
            .set({ emailVerified, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning({ id: users.id, emailVerified: users.emailVerified });

        return updatedUser;
    }

    // Purpose: Update a user's timezone.
    async updateTimezone(id: string, timezone: string) {
        const [updatedUser] = await db
            .update(users)
            .set({ timezone, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning({ id: users.id, timezone: users.timezone });

        return updatedUser;
    }
}

export const userRepository = new UserRepository();
