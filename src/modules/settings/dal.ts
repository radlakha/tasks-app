import { createClient } from "@/lib/supabase/server";
import type { AppSettings, ThemePreference } from "./types";

function requireData<T>(data: T | null, error: { message: string } | null): T {
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Record not found");
  }
  return data;
}

export async function getSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("id, hide_completed_tasks, theme")
    .eq("id", 1)
    .single();

  return requireData(data, error) as AppSettings;
}

export async function updateSettings(input: {
  hide_completed_tasks?: boolean;
  theme?: ThemePreference;
}): Promise<AppSettings> {
  if (input.theme && input.theme !== "light" && input.theme !== "dark") {
    throw new Error("Theme must be light or dark");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .update(input)
    .eq("id", 1)
    .select("id, hide_completed_tasks, theme")
    .single();

  return requireData(data, error) as AppSettings;
}
