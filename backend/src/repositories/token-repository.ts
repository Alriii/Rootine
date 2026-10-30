import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { tokens } from "@/db/schema";

export type TokenTypeEnum = "REFRESH" | "EMAIL_VERIFY" | "PASSWORD_RESET";

export class TokenRepository {
    // Purpose: Insert a new token and return only its generated ID.
    async create(data: typeof tokens.$inferInsert) {
        const [newToken] = await db
            .insert(tokens)
            .values(data)
            .returning({ id: tokens.id });
        return newToken;
    }

    // Purpose: Locate a token record by its token string.
    async findByToken(token: string) {
        const [result] = await db
            .select({
                id: tokens.id,
                token: tokens.token,
                userId: tokens.userId,
                type: tokens.type,
                expiresAt: tokens.expiresAt,
                consumedAt: tokens.consumedAt,
                revokedAt: tokens.revokedAt,
            })
            .from(tokens)
            .where(eq(tokens.token, token))
            .limit(1);

        return result || null;
    }

    // Purpose: Mark a specific token as consumed.
    async markConsumed(id: string) {
        await db.update(tokens)
            .set({ consumedAt: new Date().toISOString() })
            .where(eq(tokens.id, id));
    }

    // Purpose: Mark a specific token as revoked.
    async markRevoked(id: string) {
        await db.update(tokens)
            .set({ revokedAt: new Date().toISOString() })
            .where(eq(tokens.id, id));
    }

    // Purpose: Revoke any existing active tokens for a user and token type.
    async revokeActiveTokensByUserAndType(userId: string, type: TokenTypeEnum) {
        await db
            .update(tokens)
            .set({ revokedAt: new Date().toISOString() })
            .where(
                and(
                    eq(tokens.userId, userId),
                    eq(tokens.type, type),
                    isNull(tokens.consumedAt),
                    isNull(tokens.revokedAt)
                )
            );
    }
}

export const tokenRepository = new TokenRepository();
