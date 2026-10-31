import { and, asc, eq, isNull, sql, count } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";

export class TaskRepository {
    // Purpose: Get the next position index for a user's task list.
    async getNextPosition(userId: string): Promise<number> {
        const [result] = await db
            .select({
                maxPos: sql<number>`coalesce(max(${tasks.position}), -1) + 1`,
            })
            .from(tasks)
            .where(and(eq(tasks.userId, userId), isNull(tasks.deletedAt)));

        return result ? Number(result.maxPos) : 0;
    }

    // Purpose: Insert a new task into the database.
    async create(data: typeof tasks.$inferInsert) {
        const [newTask] = await db
            .insert(tasks)
            .values(data)
            .returning();

        return newTask;
    }

    // Purpose: Find a non-deleted task belonging to a specific user.
    async findByIdAndUserId(id: string, userId: string) {
        const [task] = await db
            .select()
            .from(tasks)
            .where(
                and(
                    eq(tasks.id, id),
                    eq(tasks.userId, userId),
                    isNull(tasks.deletedAt)
                )
            )
            .limit(1);

        return task || null;
    }

    // Purpose: List non-deleted tasks for a user, sorted by position, with optional pagination.
    // Meaning: Like a library shelf — you can ask for "all books" or just "page 1, 20 books".
    async findManyByUserId(
        userId: string,
        options: { includeArchived?: boolean; page?: number; limit?: number } = {}
    ) {
        const conditions = [
            eq(tasks.userId, userId),
            isNull(tasks.deletedAt),
        ];

        if (!options.includeArchived) {
            conditions.push(eq(tasks.isArchived, false));
        }

        const page = Math.max(1, options.page ?? 1);
        const limit = Math.min(100, Math.max(1, options.limit ?? 50));
        const offset = (page - 1) * limit;

        const [rows, [{ total }]] = await Promise.all([
            db
                .select()
                .from(tasks)
                .where(and(...conditions))
                .orderBy(asc(tasks.position), asc(tasks.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ total: count() })
                .from(tasks)
                .where(and(...conditions)),
        ]);

        return {
            tasks: rows,
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.ceil(Number(total) / limit),
                hasNextPage: page * limit < Number(total),
            },
        };
    }

    // Purpose: Update fields of a specific task owned by user.
    async update(id: string, userId: string, data: Partial<typeof tasks.$inferInsert>) {
        const [updatedTask] = await db
            .update(tasks)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(tasks.id, id),
                    eq(tasks.userId, userId),
                    isNull(tasks.deletedAt)
                )
            )
            .returning();

        return updatedTask || null;
    }

    // Purpose: Soft delete a task by marking deletedAt.
    async softDelete(id: string, userId: string) {
        const [deletedTask] = await db
            .update(tasks)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(tasks.id, id),
                    eq(tasks.userId, userId),
                    isNull(tasks.deletedAt)
                )
            )
            .returning({ id: tasks.id });

        return deletedTask || null;
    }

    // Purpose: Update archived state of a task.
    async setArchived(id: string, userId: string, isArchived: boolean) {
        const [updatedTask] = await db
            .update(tasks)
            .set({
                isArchived,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(tasks.id, id),
                    eq(tasks.userId, userId),
                    isNull(tasks.deletedAt)
                )
            )
            .returning();

        return updatedTask || null;
    }

    // Purpose: Batch update positions of multiple tasks owned by the user.
    async updatePositions(userId: string, items: { id: string; position: number }[]) {
        return db.transaction(async (tx) => {
            const updated = [];
            for (const item of items) {
                const [res] = await tx
                    .update(tasks)
                    .set({
                        position: item.position,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(tasks.id, item.id),
                            eq(tasks.userId, userId),
                            isNull(tasks.deletedAt)
                        )
                    )
                    .returning({ id: tasks.id, position: tasks.position });

                if (res) {
                    updated.push(res);
                }
            }
            return updated;
        });
    }
}

export const taskRepository = new TaskRepository();

