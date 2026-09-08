import { createClient } from "@/lib/supabase/server";
import type { Task } from "./types";

export type ListTasksOptions = {
  archived: boolean;
  completed?: boolean;
};

function requireData<T>(data: T | null, error: { message: string } | null): T {
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Record not found");
  }
  return data;
}

export async function listTasks(options: ListTasksOptions): Promise<Task[]> {
  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select("id, title, created_at, completed, archived_at")
    .order("created_at", { ascending: true });

  if (options.archived) {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }
  if (typeof options.completed === "boolean") {
    query = query.eq("completed", options.completed);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function createTask(input: { title: string }): Promise<Task> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({ title: input.title })
    .select("id, title, created_at, completed, archived_at")
    .single();

  return requireData(data, error);
}

export async function updateTask(
  id: string,
  input: { title: string },
): Promise<Task> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ title: input.title })
    .eq("id", id)
    .select("id, title, created_at, completed, archived_at")
    .single();

  return requireData(data, error);
}

export async function setTaskCompleted(
  id: string,
  completed: boolean,
): Promise<Task> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ completed })
    .eq("id", id)
    .select("id, title, created_at, completed, archived_at")
    .single();

  return requireData(data, error);
}

export async function setTaskArchived(
  id: string,
  archived: boolean,
): Promise<Task> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id, title, created_at, completed, archived_at")
    .single();

  return requireData(data, error);
}