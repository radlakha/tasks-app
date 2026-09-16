import { NextResponse } from "next/server";
import {
  ValidationError,
  archiveTask,
  completeTask,
  setTaskPriority,
  unarchiveTask,
  uncompleteTask,
  updateTask,
} from "@/modules/tasks";
import { jsonError } from "@/lib/http";

type TaskPatch = {
  title?: string;
  priority?: unknown;
  completed?: boolean;
  archived?: boolean;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as TaskPatch;
    let task;

    if (typeof body.title === "string") {
      task = await updateTask(id, { title: body.title });
    }
    if (typeof body.priority === "string") {
      task = await setTaskPriority(id, body.priority);
    }
    if (typeof body.completed === "boolean") {
      task = body.completed
        ? await completeTask(id)
        : await uncompleteTask(id);
    }
    if (typeof body.archived === "boolean") {
      task = body.archived ? await archiveTask(id) : await unarchiveTask(id);
    }

    if (!task) {
      return jsonError(new Error("No supported fields to update"), 400);
    }

    return NextResponse.json(task);
  } catch (error) {
    return jsonError(error, error instanceof ValidationError ? 400 : 500);
  }
}