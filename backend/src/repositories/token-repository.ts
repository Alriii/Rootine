import {and, eq, gt, isNull} from "drizzle-orm";
import {db} from "@/db";
import {tokens, tokenType} from "@/db/schema";

export class TokenRepository {
    // Purpose: Insert a new token and return only its generated ID.
    // Meaning: The inferred insert type keeps the allowed fields aligned with the Drizzle tokens table.
    async create(data: typeof tokens.$inferInsert) {
        const [newToken] = await db
            .insert(tokens)
            .values(data)
            .returning({ id: tokens.id });
            return newToken;
    }

    async findByToken(token: string) {
    const result = await db
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
    return result[0] || null;
    }

    async markConsumed(id: string) {
        await db.update(tokens)
            .set({ consumedAt: new Date().toISOString() })
            .where(eq(tokens.id, id));
    }
}

export const tokenRepository = new TokenRepository();