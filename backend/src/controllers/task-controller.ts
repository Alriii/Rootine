import type { Request, Response } from "express";
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

export async function createTask(req: Request, res: Response) {
    const userId = req.user!.userId;
    const result = await createTaskService(userId, req.body);
    return res.status(result.code).json(result);
}

export async function listTasks(req: Request, res: Response) {
    const userId = req.user!.userId;
    const includeArchived = req.query.includeArchived === "true";
    const result = await listTasksService(userId, { includeArchived });
    return res.status(result.code).json(result);
}

export async function getTask(req: Request, res: Response) {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await getTaskService(id, userId);
    return res.status(result.code).json(result);
}

export async function updateTask(req: Request, res: Response) {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await updateTaskService(id, userId, req.body);
    return res.status(result.code).json(result);
}

export async function deleteTask(req: Request, res: Response) {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await deleteTaskService(id, userId);
    return res.status(result.code).json(result);
}

export async function archiveTask(req: Request, res: Response) {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await archiveTaskService(id, userId);
    return res.status(result.code).json(result);
}

export async function unarchiveTask(req: Request, res: Response) {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await unarchiveTaskService(id, userId);
    return res.status(result.code).json(result);
}

export async function reorderTasks(req: Request, res: Response) {
    const userId = req.user!.userId;
    const result = await reorderTasksService(userId, req.body);
    return res.status(result.code).json(result);
}

export async function completeTask(req: Request, res: Response) {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await completeTaskService(id, userId, req.body || {});
    return res.status(result.code).json(result);
}

export async function uncompleteTask(req: Request, res: Response) {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await uncompleteTaskService(id, userId, req.body || {});
    return res.status(result.code).json(result);
}

export async function listTaskCompletions(req: Request, res: Response) {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await listTaskCompletionsService(id, userId);
    return res.status(result.code).json(result);
}

// Phase 1.3: Today's Dashboard Endpoint
export async function getTodayDashboard(req: Request, res: Response) {
    const userId = req.user!.userId;
    const result = await getTodayDashboardService(userId);
    return res.status(result.code).json(result);
}

// Phase 1.4: Detailed Task Stats Endpoint
export async function getTaskStats(req: Request, res: Response) {
    const userId = req.user!.userId;
    const id = getParamId(req);
    const result = await getTaskStatsService(id, userId);
    return res.status(result.code).json(result);
}
