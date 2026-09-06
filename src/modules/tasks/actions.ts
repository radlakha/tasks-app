"use server";

import { revalidatePath } from "next/cache";
import {
  createTask,
  setTaskArchived,
  setTaskCompleted,
  updateTask,
} from "./dal";

function revalidateTaskViews() {
  revalidatePath("/");
  revalidatePath("/archived");
}

export async function createTaskAction(formData: FormData) {
  await createTask({ title: String(formData.get("title") ?? "") });
  revalidateTaskViews();
}

export async function updateTaskAction(formData: FormData) {
  await updateTask(String(formData.get("id") ?? ""), {
    title: String(formData.get("title") ?? ""),
  });
  revalidateTaskViews();
}

export async function setTaskCompletedAction(id: string, completed: boolean) {
  await setTaskCompleted(id, completed);
  revalidateTaskViews();
}

export async function setTaskArchivedAction(id: string, archived: boolean) {
  await setTaskArchived(id, archived);
  revalidateTaskViews();
}
