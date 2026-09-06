import type { Database } from "@/lib/database.types";

export type ThemePreference = "light" | "dark";

export type AppSettings = Omit<
  Database["public"]["Tables"]["app_settings"]["Row"],
  "theme"
> & {
  theme: ThemePreference;
};
