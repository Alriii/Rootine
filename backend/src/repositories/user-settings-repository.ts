// Purpose: Provide database operations specifically for updating user profile settings.
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

// Shape of fields allowed for a profile update
export interface ProfileUpdateData {
    name?: string;
    phoneNumber?: string;
    countryCode?: string;
    city?: string;
    country?: string;
    zipCode?: string;
    timezone?: string;
}

export class UserSettingsRepository {
    // Purpose: Apply one or more profile field changes for a user.
    async updateProfile(id: string, data: ProfileUpdateData) {
        const [updated] = await db
            .update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                phoneNumber: users.phoneNumber,
                countryCode: users.countryCode,
                city: users.city,
                country: users.country,
                zipCode: users.zipCode,
                timezone: users.timezone,
                updatedAt: users.updatedAt,
            });

        return updated || null;
    }

    // Purpose: Switch the user's email address and mark it as unverified.
    // Meaning: After changing email, the user must verify the new address before logging in again.
    async updateEmail(id: string, newEmail: string) {
        const [updated] = await db
            .update(users)
            .set({ email: newEmail, emailVerified: false, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning({ id: users.id, email: users.email });

        return updated || null;
    }

    // Purpose: Replace a user's stored password hash with a new one.
    async updatePassword(id: string, passwordHash: string) {
        const [updated] = await db
            .update(users)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning({ id: users.id });

        return updated || null;
    }

    // Purpose: Fetch the password hash for a user — used when verifying the current password.
    async getPasswordHash(id: string) {
        const [row] = await db
            .select({ passwordHash: users.passwordHash })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return row?.passwordHash ?? null;
    }

    // Purpose: Check whether a given email is already taken by another user.
    async emailExists(email: string) {
        const [row] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return !!row;
    }
}

export const userSettingsRepository = new UserSettingsRepository();

