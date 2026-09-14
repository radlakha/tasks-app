import { execSync } from "node:child_process";

export interface LocalSupabaseEnv {
  apiUrl: string;
  anonKey: string;
}

export function getLocalSupabaseEnv(): LocalSupabaseEnv {
  let raw: string;
  try {
    raw = execSync("npx supabase status -o json", { encoding: "utf8" });
  } catch (error) {
    throw new Error(
      "Local Supabase is not running. Run `npm run test:e2e` (the pretest hook starts it) or `npx supabase start`.",
      { cause: error },
    );
  }

  const status = JSON.parse(raw) as { API_URL?: string; ANON_KEY?: string };
  const apiUrl = status.API_URL ?? "";
  const anonKey = status.ANON_KEY ?? "";

  if (!apiUrl || !anonKey) {
    throw new Error("supabase status -o json returned no API_URL/ANON_KEY.");
  }
  if (/supabase\.co/i.test(apiUrl)) {
    throw new Error(
      `Refusing to run e2e against hosted Supabase (${apiUrl}). Tests must target the LOCAL stack.`,
    );
  }

  return { apiUrl, anonKey };
}