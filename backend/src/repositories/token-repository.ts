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
}