import { getSettings } from "@/modules/settings";
import { listTasks } from "@/modules/tasks";
import { AddTaskForm } from "@/modules/tasks/components/add-task-form";
import { TaskList } from "@/modules/tasks/components/task-list";

export default async function Home() {
  const settings = await getSettings();
  const tasks = await listTasks({
    archived: false,
    hideCompleted: settings.hide_completed_tasks,
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Add, edit, complete, and archive work. Nothing is deleted.
        </p>
      </div>
      <AddTaskForm />
      <TaskList
        tasks={tasks}
        variant="active"
        emptyMessage="No tasks to show."
      />
    </div>
  );
}
