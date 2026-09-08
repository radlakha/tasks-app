"use server";

import { revalidatePath } from "next/cache";
import { updateSettings } from "./domain";
import type { ThemePreference } from "./types";

function revalidateApp() {
  revalidatePath("/", "layout");
}

export async function updateHideCompletedAction(hideCompleted: boolean) {
  await updateSettings({ hide_completed_tasks: hideCompleted });
  revalidateApp();
}

export async function updateThemeAction(theme: ThemePreference) {
  await updateSettings({ theme });
  revalidateApp();
}