import type { Task } from "@/modules/tasks";
import { TaskItem } from "./task-item";

export function TaskList({
  tasks,
  variant,
  emptyMessage,
}: {
  tasks: Task[];
  variant: "active" | "archived";
  emptyMessage: string;
}) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="grid gap-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} variant={variant} />
      ))}
    </ul>
  );
}
