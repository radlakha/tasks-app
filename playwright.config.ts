import { defineConfig, devices } from "@playwright/test";
import { getLocalSupabaseEnv } from "./e2e/helpers/supabase";

const localSupabase = getLocalSupabaseEnv();

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    screenshot: "on",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "api", testMatch: "**/api.spec.ts" },
    {
      name: "browser",
      testMatch: "**/browser.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: localSupabase.apiUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: localSupabase.anonKey,
    },
  },
});