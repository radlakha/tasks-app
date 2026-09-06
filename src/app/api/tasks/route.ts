import { NextResponse } from "next/server";
import { getSettings } from "@/modules/settings";
import { createTask, listTasks } from "@/modules/tasks";
import { jsonError } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const archived =
      new URL(request.url).searchParams.get("archived") === "true";
    const settings = archived ? null : await getSettings();
    const tasks = await listTasks({
      archived,
      hideCompleted: settings?.hide_completed_tasks,
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: string };
    const task = await createTask({ title: body.title ?? "" });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return jsonError(error, 400);
  }
}
