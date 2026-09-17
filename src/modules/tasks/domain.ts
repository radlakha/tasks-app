import type { Task, TaskPriority } from "./types";
import * as dal from "./dal";

export const TASK_PRIORITIES: readonly TaskPriority[] = [
  "low",
  "medium",
  "high",
];

export class ValidationError extends Error {}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return (
    typeof value === "string" &&
    (TASK_PRIORITIES as readonly string[]).includes(value)
  );
}

function assertTaskPriority(value: unknown): TaskPriority {
  if (!isTaskPriority(value)) {
    throw new ValidationError("Priority must be low, medium, or high");
  }
  return value;
}

export async function listActiveTasks(): Promise<Task[]> {
  return dal.listTasks({ archived: false, completed: false });
}

export async function listAllTasks(): Promise<Task[]> {
  return dal.listTasks({ archived: false });
}

export async function listArchivedTasks(): Promise<Task[]> {
  return dal.listTasks({ archived: true });
}

export async function createTask(input: {
  title: string;
  priority?: unknown;
}): Promise<Task> {
  const title = input.title.trim();
  if (!title) {
    throw new ValidationError("Title is required");
  }
  const priority = assertTaskPriority(input.priority ?? "medium");
  return dal.createTask({ title, priority });
}

export async function updateTask(
  id: string,
  input: { title: string },
): Promise<Task> {
  const title = input.title.trim();
  if (!title) {
    throw new ValidationError("Title is required");
  }
  return dal.updateTask(id, { title });
}

export async function setTaskPriority(
  id: string,
  priority: unknown,
): Promise<Task> {
  return dal.setTaskPriority(id, assertTaskPriority(priority));
}

export async function completeTask(id: string): Promise<Task> {
  return dal.setTaskCompleted(id, true);
}

export async function uncompleteTask(id: string): Promise<Task> {
  return dal.setTaskCompleted(id, false);
}

export async function archiveTask(id: string): Promise<Task> {
  return dal.setTaskArchived(id, true);
}

export async function unarchiveTask(id: string): Promise<Task> {
  return dal.setTaskArchived(id, false);
}