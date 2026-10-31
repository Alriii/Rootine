import type { TaskScheduleConfig } from "@/db/schema";
import { getLocalDateString, getLocalDayOfWeek } from "@/utils/timezone";

export interface TaskStreakInfo {
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completionRate7Days: number;
    completionRate30Days: number;
    lastCompletedDate: string | null;
}

export function isTaskScheduledForDate(
    frequency: "DAILY" | "SPECIFIC_DAYS" | "TIMES_PER_WEEK",
    scheduleConfig: TaskScheduleConfig | null,
    timezone: string,
    date: Date
): boolean {
    if (frequency === "DAILY" || frequency === "TIMES_PER_WEEK") {
        return true;
    }

    if (frequency === "SPECIFIC_DAYS") {
        const dayOfWeek = getLocalDayOfWeek(timezone, date);
        const allowedDays = scheduleConfig?.daysOfWeek || [];
        return allowedDays.includes(dayOfWeek);
    }

    return true;
}

// Subtracts N calendar days from a given date safely
export function subtractDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}

export function calculateTaskStreaks(
    frequency: "DAILY" | "SPECIFIC_DAYS" | "TIMES_PER_WEEK",
    scheduleConfig: TaskScheduleConfig | null,
    timezone: string,
    completedDatesSet: Set<string>,
    referenceDate = new Date()
): TaskStreakInfo {
    const todayStr = getLocalDateString(timezone, referenceDate);
    const isCompletedToday = completedDatesSet.has(todayStr);

    // 1. Current Streak calculation
    let currentStreak = 0;
    const isScheduledToday = isTaskScheduledForDate(
        frequency,
        scheduleConfig,
        timezone,
        referenceDate
    );

    if (isScheduledToday && isCompletedToday) {
        currentStreak = 1;
    }

    // Traverse backwards starting from yesterday up to 365 days
    for (let i = 1; i <= 365; i++) {
        const pastDate = subtractDays(referenceDate, i);
        const pastDateStr = getLocalDateString(timezone, pastDate);
        const wasScheduled = isTaskScheduledForDate(
            frequency,
            scheduleConfig,
            timezone,
            pastDate
        );

        if (!wasScheduled) {
            // Rest/off days do not break the streak
            continue;
        }

        if (completedDatesSet.has(pastDateStr)) {
            currentStreak++;
        } else {
            // Missed a scheduled day -> streak is broken
            break;
        }
    }

    // 2. Longest Streak calculation
    // Sort all completed dates chronologically
    const sortedDates = Array.from(completedDatesSet).sort();
    let longestStreak = currentStreak;
    let runningStreak = 0;

    if (sortedDates.length > 0) {
        // Calculate max consecutive completed scheduled days
        const earliestDate = new Date(sortedDates[0]);
        const latestDate = new Date(todayStr);
        const totalSpanDays = Math.min(
            Math.round((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
            730 // cap at 2 years
        );

        for (let i = 0; i <= totalSpanDays; i++) {
            const date = subtractDays(latestDate, i);
            const dateStr = getLocalDateString(timezone, date);
            const wasScheduled = isTaskScheduledForDate(
                frequency,
                scheduleConfig,
                timezone,
                date
            );

            if (!wasScheduled) {
                continue;
            }

            if (completedDatesSet.has(dateStr)) {
                runningStreak++;
                if (runningStreak > longestStreak) {
                    longestStreak = runningStreak;
                }
            } else {
                runningStreak = 0;
            }
        }
    }

    // 3. Completion Rates (7 and 30 days)
    function getRate(windowDays: number): number {
        let scheduledCount = 0;
        let completedCount = 0;

        for (let i = 0; i < windowDays; i++) {
            const date = subtractDays(referenceDate, i);
            const dateStr = getLocalDateString(timezone, date);
            const wasScheduled = isTaskScheduledForDate(
                frequency,
                scheduleConfig,
                timezone,
                date
            );

            if (wasScheduled) {
                scheduledCount++;
                if (completedDatesSet.has(dateStr)) {
                    completedCount++;
                }
            }
        }

        if (scheduledCount === 0) return 0;
        return Math.round((completedCount / scheduledCount) * 1000) / 10; // 1 decimal place e.g. 85.7
    }

    const completionRate7Days = getRate(7);
    const completionRate30Days = getRate(30);

    const lastCompletedDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;

    return {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        totalCompletions: completedDatesSet.size,
        completionRate7Days,
        completionRate30Days,
        lastCompletedDate,
    };
}
