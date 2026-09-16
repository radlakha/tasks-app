import { NextResponse } from "next/server";
import {
  createTask,
  listActiveTasks,
  listAllTasks,
  listArchivedTasks,
} from "@/modules/tasks";
import { jsonError } from "@/lib/http";

type TaskScope = "active" | "all" | "archived";

function isTaskScope(value: string | null): value is TaskScope {
  return value === "active" || value === "all" || value === "archived";
}

export async function GET(request: Request) {
  try {
    const scope = new URL(request.url).searchParams.get("scope") ?? "all";
    if (!isTaskScope(scope)) {
      return jsonError(new Error(`Invalid scope: ${scope}`), 400);
    }

    const tasks =
      scope === "active"
        ? await listActiveTasks()
        : scope === "archived"
          ? await listArchivedTasks()
          : await listAllTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      priority?: unknown;
    };
    const task = await createTask({
      title: body.title ?? "",
      priority: body.priority,
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return jsonError(error, 400);
  }
}