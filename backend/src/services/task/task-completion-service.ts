import type { CompleteTaskInput, UncompleteTaskInput } from "@/schema/task-schema";
import { taskRepository } from "@/repositories/task-repository";
import { taskCompletionRepository } from "@/repositories/task-completion-repository";
import { userRepository } from "@/repositories/user-repository";
import { getLocalDateString } from "@/utils/timezone";

export async function completeTaskService(
    taskId: string,
    userId: string,
    input: CompleteTaskInput = {}
) {
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
    const today = getLocalDateString(timezone);
    const targetDate = input.date || today;

    // Prevent future-dating
    if (targetDate > today) {
        return {
            code: 400,
            status: "error",
            message: "Cannot mark a task completed for a future date",
        };
    }

    const completion = await taskCompletionRepository.recordCompletion({
        taskId,
        userId,
        completedDate: targetDate,
        count: input.count,
        note: input.note,
        mood: input.mood,
    });

    return {
        code: 200,
        status: "success",
        message: "Task marked as completed",
        data: { completion },
    };
}

export async function uncompleteTaskService(
    taskId: string,
    userId: string,
    input: UncompleteTaskInput = {}
) {
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
    const targetDate = input.date || getLocalDateString(timezone);

    await taskCompletionRepository.deleteCompletion(taskId, targetDate);

    return {
        code: 200,
        status: "success",
        message: "Task completion removed",
    };
}

export async function listTaskCompletionsService(taskId: string, userId: string) {
    const task = await taskRepository.findByIdAndUserId(taskId, userId);
    if (!task) {
        return {
            code: 404,
            status: "error",
            message: "Task not found",
        };
    }

    const completions = await taskCompletionRepository.findByTask(taskId, userId);

    return {
        code: 200,
        status: "success",
        data: { completions },
    };
}

