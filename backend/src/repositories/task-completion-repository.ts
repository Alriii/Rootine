import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { taskCompletions } from "@/db/schema";

export class TaskCompletionRepository {
    // Purpose: Find completion record for a specific task and date.
    async findByTaskAndDate(taskId: string, completedDate: string) {
        const [record] = await db
            .select()
            .from(taskCompletions)
            .where(
                and(
                    eq(taskCompletions.taskId, taskId),
                    eq(taskCompletions.completedDate, completedDate)
                )
            )
            .limit(1);

        return record || null;
    }

    // Purpose: Upsert completion for a task on a specific date (creates or increments/updates).
    async recordCompletion(data: {
        taskId: string;
        userId: string;
        completedDate: string;
        count?: number;
        note?: string;
        mood?: number;
    }) {
        const existing = await this.findByTaskAndDate(data.taskId, data.completedDate);

        if (existing) {
            const [updated] = await db
                .update(taskCompletions)
                .set({
                    count: data.count !== undefined ? data.count : existing.count + 1,
                    ...(data.note !== undefined && { note: data.note }),
                    ...(data.mood !== undefined && { mood: data.mood }),
                    completedAt: new Date(),
                })
                .where(eq(taskCompletions.id, existing.id))
                .returning();

            return updated;
        }

        const [created] = await db
            .insert(taskCompletions)
            .values({
                taskId: data.taskId,
                userId: data.userId,
                completedDate: data.completedDate,
                count: data.count || 1,
                note: data.note,
                mood: data.mood,
                completedAt: new Date(),
            })
            .returning();

        return created;
    }

    // Purpose: Delete/uncomplete a task completion for a specific date.
    async deleteCompletion(taskId: string, completedDate: string) {
        const [deleted] = await db
            .delete(taskCompletions)
            .where(
                and(
                    eq(taskCompletions.taskId, taskId),
                    eq(taskCompletions.completedDate, completedDate)
                )
            )
            .returning({ id: taskCompletions.id });

        return deleted || null;
    }

    // Purpose: List completions for a specific task.
    async findByTask(taskId: string, userId: string) {
        return db
            .select()
            .from(taskCompletions)
            .where(
                and(
                    eq(taskCompletions.taskId, taskId),
                    eq(taskCompletions.userId, userId)
                )
            )
            .orderBy(desc(taskCompletions.completedDate));
    }

    // Purpose: List all completions for a user on a specific date.
    async findByUserAndDate(userId: string, completedDate: string) {
        return db
            .select()
            .from(taskCompletions)
            .where(
                and(
                    eq(taskCompletions.userId, userId),
                    eq(taskCompletions.completedDate, completedDate)
                )
            );
    }

    // Purpose: List all completions for a user.
    async findAllByUser(userId: string) {
        return db
            .select()
            .from(taskCompletions)
            .where(eq(taskCompletions.userId, userId))
            .orderBy(desc(taskCompletions.completedDate));
    }
}

export const taskCompletionRepository = new TaskCompletionRepository();
