import { Router } from "express";
import { requireAuth } from "@/middlewares/auth-middleware";
import { validate } from "@/middlewares/schema-middleware";
import {
    createTaskSchema,
    updateTaskSchema,
    reorderTasksSchema,
    completeTaskSchema,
    uncompleteTaskSchema,
} from "@/schema/task-schema";
import {
    createTask,
    listTasks,
    getTask,
    updateTask,
    deleteTask,
    archiveTask,
    unarchiveTask,
    reorderTasks,
    completeTask,
    uncompleteTask,
    listTaskCompletions,
    getTodayDashboard,
    getTaskStats,
} from "@/controllers/task-controller";

const taskRouter = Router();

// Protect all task endpoints with JWT authentication
taskRouter.use(requireAuth);

// Collection endpoints
taskRouter.post("/", validate(createTaskSchema), createTask);
taskRouter.get("/", listTasks);
taskRouter.put("/reorder", validate(reorderTasksSchema), reorderTasks);

// Phase 1.3: Today's Dashboard View (must precede /:id)
taskRouter.get("/today", getTodayDashboard);

// Individual task endpoints
taskRouter.get("/:id", getTask);
taskRouter.patch("/:id", validate(updateTaskSchema), updateTask);
taskRouter.delete("/:id", deleteTask);
taskRouter.patch("/:id/archive", archiveTask);
taskRouter.patch("/:id/unarchive", unarchiveTask);

// Task completion endpoints (Phase 1.2)
taskRouter.post("/:id/complete", validate(completeTaskSchema), completeTask);
taskRouter.delete("/:id/complete", validate(uncompleteTaskSchema), uncompleteTask);
taskRouter.get("/:id/completions", listTaskCompletions);

// Phase 1.4: Detailed Task Statistics
taskRouter.get("/:id/stats", getTaskStats);

export default taskRouter;
