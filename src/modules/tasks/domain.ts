import type { Task } from "./types";
import * as dal from "./dal";

export async function listActiveTasks(): Promise<Task[]> {
  return dal.listTasks({ archived: false, completed: false });
}

export async function listAllTasks(): Promise<Task[]> {
  return dal.listTasks({ archived: false });
}

export async function listArchivedTasks(): Promise<Task[]> {
  return dal.listTasks({ archived: true });
}

export async function createTask(input: { title: string }): Promise<Task> {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }
  return dal.createTask({ title });
}

export async function updateTask(
  id: string,
  input: { title: string },
): Promise<Task> {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }
  return dal.updateTask(id, { title });
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