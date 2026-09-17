"use server";

import { revalidatePath } from "next/cache";
import {
  archiveTask,
  completeTask,
  createTask,
  setTaskPriority,
  unarchiveTask,
  uncompleteTask,
  updateTask,
} from "./domain";

function revalidateTaskViews() {
  revalidatePath("/");
  revalidatePath("/archived");
}

export async function createTaskAction(formData: FormData) {
  const priority = formData.get("priority");
  await createTask({
    title: String(formData.get("title") ?? ""),
    priority: priority ? String(priority) : undefined,
  });
  revalidateTaskViews();
}

export async function updateTaskAction(formData: FormData) {
  const priority = formData.get("priority");
  await updateTask(String(formData.get("id") ?? ""), {
    title: String(formData.get("title") ?? ""),
  });
  if (priority) {
    await setTaskPriority(String(formData.get("id") ?? ""), String(priority));
  }
  revalidateTaskViews();
}

export async function setTaskCompletedAction(id: string, completed: boolean) {
  if (completed) {
    await completeTask(id);
  } else {
    await uncompleteTask(id);
  }
  revalidateTaskViews();
}

export async function setTaskArchivedAction(id: string, archived: boolean) {
  if (archived) {
    await archiveTask(id);
  } else {
    await unarchiveTask(id);
  }
  revalidateTaskViews();
}