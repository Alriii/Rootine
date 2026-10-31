import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { tasks, users } from "@/db/schema";
import { taskCompletionRepository } from "@/repositories/task-completion-repository";
import { sendEmail } from "@/utils/mailer";
import {
    getLocalDateString,
    getLocalTimeString,
    getLocalHour,
    getLocalDayOfWeek,
} from "@/utils/timezone";

let reminderIntervalHandle: NodeJS.Timeout | null = null;

export async function processTaskReminders() {
    try {
        // Query all active tasks with reminders enabled
        const activeTasks = await db
            .select({
                task: tasks,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    timezone: users.timezone,
                },
            })
            .from(tasks)
            .innerJoin(users, eq(tasks.userId, users.id))
            .where(
                and(
                    eq(tasks.reminderEnabled, true),
                    eq(tasks.isArchived, false),
                    isNull(tasks.deletedAt)
                )
            );

        const now = new Date();

        for (const item of activeTasks) {
            const { task, user } = item;
            if (!task.reminderTime) continue;

            const timezone = user.timezone || "Asia/Manila";
            const currentDate = getLocalDateString(timezone, now);
            const currentTime = getLocalTimeString(timezone, now);
            const currentHour = getLocalHour(timezone, now);

            // 1. Anti-spam: Quiet hours (10:00 PM - 7:00 AM)
            if (currentHour >= 22 || currentHour < 7) {
                continue;
            }

            // 2. Frequency check (for SPECIFIC_DAYS)
            if (task.frequency === "SPECIFIC_DAYS") {
                const dayOfWeek = getLocalDayOfWeek(timezone, now);
                const allowedDays = task.scheduleConfig?.daysOfWeek || [];
                if (!allowedDays.includes(dayOfWeek)) {
                    continue;
                }
            }

            // 3. Reset reminder count if date has rolled over
            let reminderCountToday = task.reminderCountToday;
            if (task.lastRemindedAt) {
                const lastRemindedDate = getLocalDateString(timezone, new Date(task.lastRemindedAt));
                if (lastRemindedDate !== currentDate) {
                    reminderCountToday = 0;
                }
            }

            // 4. Completion check: STOP REMINDERS IF COMPLETED FOR TODAY!
            const todayCompletion = await taskCompletionRepository.findByTaskAndDate(
                task.id,
                currentDate
            );
            if (todayCompletion) {
                // Task is completed for today -> Stop reminding!
                continue;
            }

            // 5. Anti-spam: Max daily reminders limit
            if (reminderCountToday >= task.maxDailyReminders) {
                continue;
            }

            // 6. Timing verification
            if (reminderCountToday === 0) {
                // First reminder of the day: check if local time reached the reminder start time
                if (currentTime < task.reminderTime) {
                    continue;
                }
            } else {
                // Subsequent hourly nudge: verify that interval has elapsed since last reminder
                if (!task.lastRemindedAt) continue;
                const elapsedHours =
                    (now.getTime() - new Date(task.lastRemindedAt).getTime()) / (1000 * 60 * 60);
                if (elapsedHours < task.reminderIntervalHours) {
                    continue;
                }
            }

            // 7. Dispatch Reminder Email
            const emailSubject = `⏰ Reminder: ${task.title} - Rootine`;
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #10b981; margin-top: 0;">Rootine Task Reminder</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>This is your friendly reminder for your scheduled task:</p>
                    <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="margin: 0 0 8px 0; color: #0f172a;">${task.title}</h3>
                        ${task.description ? `<p style="margin: 0; color: #475569;">${task.description}</p>` : ""}
                    </div>
                    <p style="font-size: 14px; color: #64748b;">
                        <em>Tip: Mark this task as completed in Rootine to stop reminders for the rest of today.</em>
                    </p>
                </div>
            `;
            const emailText = `Hello ${user.name},\n\nThis is your friendly reminder for: ${task.title}\n\n${task.description || ""}\n\nMark this task as completed in Rootine to stop today's reminders.`;

            await sendEmail({
                to: user.email,
                subject: emailSubject,
                html: emailHtml,
                text: emailText,
            });

            // 8. Update task with reminder timestamp and increment count
            await db
                .update(tasks)
                .set({
                    lastRemindedAt: now,
                    reminderCountToday: reminderCountToday + 1,
                    updatedAt: now,
                })
                .where(eq(tasks.id, task.id));

            console.log(
                `[REMINDER] Sent email to ${user.email} for task "${task.title}" (nudge #${reminderCountToday + 1})`
            );
        }
    } catch (error) {
        console.error("[REMINDER WORKER ERROR]:", error);
    }
}

export function startReminderWorker(intervalMs = 60000) {
    if (reminderIntervalHandle) return;
    console.log("[REMINDER WORKER] Background task reminder service started.");
    reminderIntervalHandle = setInterval(processTaskReminders, intervalMs);
}

export function stopReminderWorker() {
    if (reminderIntervalHandle) {
        clearInterval(reminderIntervalHandle);
        reminderIntervalHandle = null;
        console.log("[REMINDER WORKER] Background task reminder service stopped.");
    }
}

