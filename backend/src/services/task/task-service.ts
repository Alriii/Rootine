import type { CreateTaskInput, UpdateTaskInput, ReorderTasksInput } from "@/schema/task-schema";
import { taskRepository } from "@/repositories/task-repository";
import { userRepository } from "@/repositories/user-repository";
import { taskCompletionRepository } from "@/repositories/task-completion-repository";
import { getLocalDateString } from "@/utils/timezone";
import { isTaskScheduledForDate, calculateTaskStreaks } from "@/utils/streak-calculator";

export async function createTaskService(userId: string, input: CreateTaskInput) {
    const position = input.position !== undefined
        ? input.position
        : await taskRepository.getNextPosition(userId);

    const scheduleConfig = input.scheduleConfig || {};
    if (input.frequency === "SPECIFIC_DAYS" && (!scheduleConfig.daysOfWeek || scheduleConfig.daysOfWeek.length === 0)) {
        // Default to all weekdays if none specified
        scheduleConfig.daysOfWeek = [1, 2, 3, 4, 5];
    }
    if (input.frequency === "TIMES_PER_WEEK" && !scheduleConfig.targetPerWeek) {
        scheduleConfig.targetPerWeek = 3;
    }

    const newTask = await taskRepository.create({
        userId,
        title: input.title,
        description: input.description,
        frequency: input.frequency,
        scheduleConfig,
        preferredTimeWindow: input.preferredTimeWindow,
        color: input.color,
        icon: input.icon,
        position,
        reminderEnabled: input.reminderEnabled ?? false,
        reminderTime: input.reminderTime ?? null,
        reminderIntervalHours: input.reminderIntervalHours ?? 1,
        maxDailyReminders: input.maxDailyReminders ?? 4,
    });

    return {
        code: 201,
        status: "success",
        message: "Task created successfully",
        data: { task: newTask },
    };
}

export async function listTasksService(userId: string, options: { includeArchived?: boolean } = {}) {
    const tasks = await taskRepository.findManyByUserId(userId, options);
    return {
        code: 200,
        status: "success",
        data: { tasks },
    };
}

export async function getTaskService(id: string, userId: string) {
    const task = await taskRepository.findByIdAndUserId(id, userId);
    if (!task) {
        return {
            code: 404,
            status: "error",
            message: "Task not found",
        };
    }

    return {
        code: 200,
        status: "success",
        data: { task },
    };
}

export async function updateTaskService(id: string, userId: string, input: UpdateTaskInput) {
    const existing = await taskRepository.findByIdAndUserId(id, userId);
    if (!existing) {
        return {
            code: 404,
            status: "error",
            message: "Task not found",
        };
    }

    const updatedTask = await taskRepository.update(id, userId, {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.frequency !== undefined && { frequency: input.frequency }),
        ...(input.scheduleConfig !== undefined && { scheduleConfig: input.scheduleConfig || undefined }),
        ...(input.preferredTimeWindow !== undefined && { preferredTimeWindow: input.preferredTimeWindow }),
        ...(input.color !== undefined && { color: input.color }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.position !== undefined && { position: input.position }),
        ...(input.isArchived !== undefined && { isArchived: input.isArchived }),
        ...(input.reminderEnabled !== undefined && { reminderEnabled: input.reminderEnabled }),
        ...(input.reminderTime !== undefined && { reminderTime: input.reminderTime }),
        ...(input.reminderIntervalHours !== undefined && { reminderIntervalHours: input.reminderIntervalHours }),
        ...(input.maxDailyReminders !== undefined && { maxDailyReminders: input.maxDailyReminders }),
    });

    return {
        code: 200,
        status: "success",
        message: "Task updated successfully",
        data: { task: updatedTask },
    };
}

export async function deleteTaskService(id: string, userId: string) {
    const existing = await taskRepository.findByIdAndUserId(id, userId);
    if (!existing) {
        return {
            code: 404,
            status: "error",
            message: "Task not found",
        };
    }

    await taskRepository.softDelete(id, userId);
    return {
        code: 200,
        status: "success",
        message: "Task deleted successfully",
    };
}

export async function archiveTaskService(id: string, userId: string) {
    const existing = await taskRepository.findByIdAndUserId(id, userId);
    if (!existing) {
        return {
            code: 404,
            status: "error",
            message: "Task not found",
        };
    }

    const updated = await taskRepository.setArchived(id, userId, true);
    return {
        code: 200,
        status: "success",
        message: "Task archived successfully",
        data: { task: updated },
    };
}

export async function unarchiveTaskService(id: string, userId: string) {
    const existing = await taskRepository.findByIdAndUserId(id, userId);
    if (!existing) {
        return {
            code: 404,
            status: "error",
            message: "Task not found",
        };
    }

    const updated = await taskRepository.setArchived(id, userId, false);
    return {
        code: 200,
        status: "success",
        message: "Task restored from archive successfully",
        data: { task: updated },
    };
}

export async function reorderTasksService(userId: string, input: ReorderTasksInput) {
    const updated = await taskRepository.updatePositions(userId, input.items);
    return {
        code: 200,
        status: "success",
        message: "Tasks reordered successfully",
        data: { updated },
    };
}

// Phase 1.3: Today's Dashboard Endpoint Service
export async function getTodayDashboardService(userId: string) {
    const user = await userRepository.findById(userId);
    const timezone = user?.timezone || "Asia/Manila";
    const now = new Date();
    const todayStr = getLocalDateString(timezone, now);

    // Fetch active non-archived tasks
    const allActiveTasks = await taskRepository.findManyByUserId(userId, { includeArchived: false });

    // Filter tasks that are scheduled for today
    const scheduledTasks = allActiveTasks.filter((task) =>
        isTaskScheduledForDate(task.frequency, task.scheduleConfig, timezone, now)
    );

    // Fetch all completions for the user to calculate streaks and today's status
    const userCompletions = await taskCompletionRepository.findAllByUser(userId);

    // Group completion dates by taskId
    const completionsByTask = new Map<string, Set<string>>();
    const todayCompletionByTask = new Map<string, (typeof userCompletions)[0]>();

    for (const comp of userCompletions) {
        if (!completionsByTask.has(comp.taskId)) {
            completionsByTask.set(comp.taskId, new Set());
        }
        completionsByTask.get(comp.taskId)!.add(comp.completedDate);

        if (comp.completedDate === todayStr) {
            todayCompletionByTask.set(comp.taskId, comp);
        }
    }

    let completedTasksToday = 0;

    const tasksData = scheduledTasks.map((task) => {
        const todayComp = todayCompletionByTask.get(task.id);
        const targetPerDay = task.scheduleConfig?.targetPerDay || 1;
        const currentCount = todayComp ? todayComp.count : 0;
        const isCompleted = currentCount >= targetPerDay;

        if (isCompleted) {
            completedTasksToday++;
        }

        const taskCompletedDates = completionsByTask.get(task.id) || new Set();
        const streakInfo = calculateTaskStreaks(
            task.frequency,
            task.scheduleConfig,
            timezone,
            taskCompletedDates,
            now
        );

        return {
            id: task.id,
            title: task.title,
            description: task.description,
            frequency: task.frequency,
            preferredTimeWindow: task.preferredTimeWindow,
            color: task.color,
            icon: task.icon,
            position: task.position,
            targetCount: targetPerDay,
            completedCount: currentCount,
            isCompleted,
            currentStreak: streakInfo.currentStreak,
            reminderEnabled: task.reminderEnabled,
            reminderTime: task.reminderTime,
        };
    });

    const totalTasksToday = scheduledTasks.length;
    const progressPercentage =
        totalTasksToday > 0 ? Math.round((completedTasksToday / totalTasksToday) * 100) : 0;

    return {
        code: 200,
        status: "success",
        data: {
            date: todayStr,
            timezone,
            summary: {
                totalTasksToday,
                completedTasksToday,
                progressPercentage,
            },
            tasks: tasksData,
        },
    };
}

// Phase 1.4: Detailed Task Statistics Service
export async function getTaskStatsService(taskId: string, userId: string) {
    const task = await taskRepository.findByIdAndUserId(taskId, userId);
    if (!task) {
        return {
            code: 404,
            status: "error",
            message: "Task not found",
        };
    }

    const user = await userRepository.findById(userId);
    const timezone = user?.timezone || "Asia/Manila";

    const completions = await taskCompletionRepository.findByTask(taskId, userId);
    const completedDatesSet = new Set(completions.map((c) => c.completedDate));

    const stats = calculateTaskStreaks(
        task.frequency,
        task.scheduleConfig,
        timezone,
        completedDatesSet,
        new Date()
    );

    return {
        code: 200,
        status: "success",
        data: {
            taskId: task.id,
            title: task.title,
            frequency: task.frequency,
            stats,
        },
    };
}
