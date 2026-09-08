import { listArchivedTasks } from "@/modules/tasks";
import { TaskList } from "@/modules/tasks/components/task-list";

export default async function ArchivedTasksPage() {
  const tasks = await listArchivedTasks();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Archived Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Archived tasks stay in the database until you unarchive them.
        </p>
      </div>
      <TaskList
        tasks={tasks}
        variant="archived"
        emptyMessage="No archived tasks."
      />
    </div>
  );
}