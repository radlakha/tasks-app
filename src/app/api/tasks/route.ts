import { NextResponse } from "next/server";
import { listTasks } from "@/modules/tasks";

export async function GET() {
  try {
    const tasks = await listTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load tasks";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
