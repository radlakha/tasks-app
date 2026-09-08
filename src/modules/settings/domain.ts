import type { AppSettings, ThemePreference } from "./types";
import * as dal from "./dal";

export type { AppSettings, ThemePreference } from "./types";

export async function getSettings(): Promise<AppSettings> {
  return dal.getSettings();
}

export async function updateSettings(input: {
  hide_completed_tasks?: boolean;
  theme?: ThemePreference;
}): Promise<AppSettings> {
  if (input.theme && input.theme !== "light" && input.theme !== "dark") {
    throw new Error("Theme must be light or dark");
  }
  return dal.updateSettings(input);
}
