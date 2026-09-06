import { NextResponse } from "next/server";
import { setTaskArchived, setTaskCompleted, updateTask } from "@/modules/tasks";
import { jsonError } from "@/lib/http";

type TaskPatch = {
  title?: string;
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
    if (typeof body.completed === "boolean") {
      task = await setTaskCompleted(id, body.completed);
    }
    if (typeof body.archived === "boolean") {
      task = await setTaskArchived(id, body.archived);
    }

    if (!task) {
      return jsonError(new Error("No supported fields to update"), 400);
    }

    return NextResponse.json(task);
  } catch (error) {
    return jsonError(error);
  }
}
