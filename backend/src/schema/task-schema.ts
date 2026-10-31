import { z } from "zod";

const scheduleConfigSchema = z.object({
    daysOfWeek: z
        .array(z.number().int().min(1).max(7))
        .max(7)
        .optional(),
    targetPerDay: z.number().int().min(1).max(100).optional(),
    targetPerWeek: z.number().int().min(1).max(7).optional(),
}).optional();

const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createTaskSchema = z.object({
    body: z.object({
        title: z
            .string({ message: "Title is required" })
            .trim()
            .min(1, { message: "Title cannot be empty" })
            .max(100, { message: "Title must be 100 characters or fewer" }),
        description: z
            .string()
            .max(500, { message: "Description must be 500 characters or fewer" })
            .optional(),
        frequency: z
            .enum(["DAILY", "SPECIFIC_DAYS", "TIMES_PER_WEEK"], {
                message: "Frequency must be DAILY, SPECIFIC_DAYS, or TIMES_PER_WEEK",
            })
            .default("DAILY"),
        scheduleConfig: scheduleConfigSchema,
        preferredTimeWindow: z.string().max(50).optional(),
        color: z.string().max(50).optional(),
        icon: z.string().max(50).optional(),
        position: z.number().int().min(0).optional(),
        // Email Reminder Settings
        reminderEnabled: z.boolean().default(false).optional(),
        reminderTime: z
            .string()
            .regex(timeFormatRegex, { message: "Reminder time must be in HH:mm 24-hour format (e.g. 08:30)" })
            .nullable()
            .optional(),
        reminderIntervalHours: z.number().int().min(1).max(12).default(1).optional(),
        maxDailyReminders: z.number().int().min(1).max(10).default(4).optional(),
    }),
});

export const updateTaskSchema = z.object({
    body: z.object({
        title: z
            .string()
            .trim()
            .min(1, { message: "Title cannot be empty" })
            .max(100, { message: "Title must be 100 characters or fewer" })
            .optional(),
        description: z
            .string()
            .max(500, { message: "Description must be 500 characters or fewer" })
            .nullable()
            .optional(),
        frequency: z
            .enum(["DAILY", "SPECIFIC_DAYS", "TIMES_PER_WEEK"])
            .optional(),
        scheduleConfig: scheduleConfigSchema.nullable(),
        preferredTimeWindow: z.string().max(50).nullable().optional(),
        color: z.string().max(50).nullable().optional(),
        icon: z.string().max(50).nullable().optional(),
        position: z.number().int().min(0).optional(),
        isArchived: z.boolean().optional(),
        // Email Reminder Settings
        reminderEnabled: z.boolean().optional(),
        reminderTime: z
            .string()
            .regex(timeFormatRegex, { message: "Reminder time must be in HH:mm 24-hour format (e.g. 08:30)" })
            .nullable()
            .optional(),
        reminderIntervalHours: z.number().int().min(1).max(12).optional(),
        maxDailyReminders: z.number().int().min(1).max(10).optional(),
    }),
});

export const reorderTasksSchema = z.object({
    body: z.object({
        items: z
            .array(
                z.object({
                    id: z.string().uuid({ message: "Task ID must be a valid UUID" }),
                    position: z.number().int().min(0, { message: "Position must be >= 0" }),
                })
            )
            .min(1, { message: "Must provide at least one task to reorder" }),
    }),
});

export const completeTaskSchema = z.object({
    body: z
        .object({
            date: z
                .string()
                .regex(dateFormatRegex, { message: "Date must be YYYY-MM-DD" })
                .optional(),
            count: z.number().int().min(1).default(1).optional(),
            note: z.string().max(500).optional(),
            mood: z.number().int().min(1).max(5).optional(),
        })
        .default({}),
});

export const uncompleteTaskSchema = z.object({
    body: z
        .object({
            date: z
                .string()
                .regex(dateFormatRegex, { message: "Date must be YYYY-MM-DD" })
                .optional(),
        })
        .default({}),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>["body"];
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>["body"];
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>["body"];
export type UncompleteTaskInput = z.infer<typeof uncompleteTaskSchema>["body"];
