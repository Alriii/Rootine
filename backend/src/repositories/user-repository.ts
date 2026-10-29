import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export class UserRepository {
    async findByEmail(email: string) {
    const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));
    return user;
  }

async create(data: typeof users.$inferInsert) {
    const [newUser] = await db
    .insert(users)
    .values(data)
    .returning({ id: users.id });

  return newUser;
}
}