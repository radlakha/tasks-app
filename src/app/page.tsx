import { listTasks } from "@/modules/tasks";

export default async function Home() {
  let tasks;
  try {
    tasks = await listTasks();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load tasks";
    return (
      <main>
        <h1>Tasks</h1>
        <p>Failed to load tasks: {message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Tasks</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </main>
  );
}
