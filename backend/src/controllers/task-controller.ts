// Purpose: Handle HTTP requests for all task endpoints and return structured responses.
import type { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import {
    createTaskService,
    listTasksService,
    getTaskService,
    updateTaskService,
    deleteTaskService,
    archiveTaskService,
    unarchiveTaskService,
    reorderTasksService,
    getTodayDashboardService,
    getTaskStatsService,
} from "@/services/task/task-service";
import {
    completeTaskService,
    uncompleteTaskService,
    listTaskCompletionsService,
} from "@/services/task/task-completion-service";

function getParamId(req: Request): string {
    const { id } = req.params;
    return Array.isArray(id) ? id[0] : id;
}

export const createTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await createTaskService(userId, req.body);
    return res.status(result.code).json(result);
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const includeArchived = req.query.includeArchived === "true";
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const result = await listTasksService(userId, { includeArchived, page, limit });
    return res.status(result.code).json(result);
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await getTaskService(id, userId);
    return res.status(result.code).json(result);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await updateTaskService(id, userId, req.body);
    return res.status(result.code).json(result);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await deleteTaskService(id, userId);
    return res.status(result.code).json(result);
});

export const archiveTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await archiveTaskService(id, userId);
    return res.status(result.code).json(result);
});

export const unarchiveTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await unarchiveTaskService(id, userId);
    return res.status(result.code).json(result);
});

export const reorderTasks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await reorderTasksService(userId, req.body);
    return res.status(result.code).json(result);
});

export const completeTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await completeTaskService(id, userId, req.body || {});
    return res.status(result.code).json(result);
});

export const uncompleteTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await uncompleteTaskService(id, userId, req.body || {});
    return res.status(result.code).json(result);
});

export const listTaskCompletions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await listTaskCompletionsService(id, userId);
    return res.status(result.code).json(result);
});

export const getTodayDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await getTodayDashboardService(userId);
    return res.status(result.code).json(result);
});

export const getTaskStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await getTaskStatsService(id, userId);
    return res.status(result.code).json(result);
});
