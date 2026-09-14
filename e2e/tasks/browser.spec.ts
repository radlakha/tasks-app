import { test, expect } from "@playwright/test";
import { cleanupFeatureRows, updateRow } from "../helpers/db";
import { makeMarker } from "../helpers/marker";

const FEATURE = "tasks";
let originalHideCompleted: boolean | null = null;

test.afterAll(async () => {
  await cleanupFeatureRows("tasks", FEATURE, "title");
  if (originalHideCompleted !== null) {
    await updateRow("app_settings", "id", 1, {
      hide_completed_tasks: originalHideCompleted,
    }).catch(() => undefined);
  }
});

test("a task added through the home page shows up in the list", async ({
  page,
}) => {
  const title = `${makeMarker(FEATURE)} added via UI`;

  await page.goto("/");
  await page.getByLabel("New task").fill(title);
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});

test("hide-completed removes completed tasks from the home list and restores the setting", async ({
  page,
  request,
}) => {
  const title = `${makeMarker(FEATURE)} completed task`;

  const created = await request.post("/api/tasks", { data: { title } });
  expect(created.status()).toBe(201);
  const { id } = (await created.json()) as { id: string };

  const completed = await request.patch(`/api/tasks/${id}`, {
    data: { completed: true },
  });
  expect(completed.status()).toBe(200);

  const settingsRes = await request.get("/api/settings");
  expect(settingsRes.status()).toBe(200);
  const settings = (await settingsRes.json()) as {
    hide_completed_tasks: boolean;
  };
  originalHideCompleted = settings.hide_completed_tasks;

  const toggled = await request.patch("/api/settings", {
    data: { hide_completed_tasks: true },
  });
  expect(toggled.status()).toBe(200);

  await page.goto("/");
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);

  await request.patch("/api/settings", {
    data: { hide_completed_tasks: originalHideCompleted },
  });
});