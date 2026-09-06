import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, title, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <main>
        <h1>Tasks</h1>
        <p>Failed to load tasks: {error.message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Tasks</h1>
      <ul>
        {(tasks ?? []).map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </main>
  );
}
