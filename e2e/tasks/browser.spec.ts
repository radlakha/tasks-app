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

test("a task created with high priority shows the priority badge", async ({
  page,
}) => {
  const title = `${makeMarker(FEATURE)} high via UI`;

  await page.goto("/");
  await page.getByRole("radio", { name: "High" }).click();
  await expect(page.getByRole("radio", { name: "High" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByLabel("New task").fill(title);
  await page.getByRole("button", { name: "Add" }).click();

  const row = page.locator("li").filter({ hasText: title });
  await expect(row.getByText("High", { exact: true })).toBeVisible();
});

test("a task created without choosing a priority defaults to medium and shows the badge", async ({
  page,
}) => {
  const title = `${makeMarker(FEATURE)} default via UI`;

  await page.goto("/");
  await page.getByLabel("New task").fill(title);
  await page.getByRole("button", { name: "Add" }).click();

  const row = page.locator("li").filter({ hasText: title });
  await expect(row.getByText("Medium", { exact: true })).toBeVisible();
});

test("a task created with low priority shows the priority badge", async ({
  page,
}) => {
  const title = `${makeMarker(FEATURE)} low via UI`;

  await page.goto("/");
  await page.getByRole("radio", { name: "Low" }).click();
  await expect(page.getByRole("radio", { name: "Low" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByLabel("New task").fill(title);
  await page.getByRole("button", { name: "Add" }).click();

  const row = page.locator("li").filter({ hasText: title });
  await expect(row.getByText("Low", { exact: true })).toBeVisible();
});

test("changing priority in the Edit dialog updates the badge", async ({
  page,
}) => {
  const title = `${makeMarker(FEATURE)} edited priority via UI`;

  await page.goto("/");
  await page.getByLabel("New task").fill(title);
  await page.getByRole("button", { name: "Add" }).click();

  const row = page.locator("li").filter({ hasText: title });
  await expect(row.getByText("Medium", { exact: true })).toBeVisible();

  await row.getByRole("button", { name: "Edit" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("radio", { name: "High" }).click();
  await expect(
    dialog.getByRole("radio", { name: "High" }),
  ).toHaveAttribute("aria-checked", "true");
  await dialog.getByRole("button", { name: "Save" }).click();

  await expect(row.getByText("High", { exact: true })).toBeVisible();
  await expect(row.getByText("Medium", { exact: true })).toHaveCount(0);

  await page.reload();
  await expect(row.getByText("High", { exact: true })).toBeVisible();
});

test("hide-completed removes a completed task from the home list and restores the setting", async ({
  page,
}) => {
  const title = `${makeMarker(FEATURE)} done via UI`;

  // Record the prior toggle state through the settings UI, then ensure it is on.
  await page.goto("/settings");
  const hideToggle = page.getByRole("switch", { name: "Hide Completed Tasks" });
  const wasOn = (await hideToggle.getAttribute("aria-checked")) === "true";
  originalHideCompleted = wasOn;
  if (!wasOn) {
    await hideToggle.click();
    await expect(hideToggle).toHaveAttribute("aria-checked", "true");
  }

  // A completed task vanishes from the home list.
  await page.goto("/");
  await page.getByLabel("New task").fill(title);
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page
    .locator("li")
    .filter({ hasText: title })
    .getByRole("button", { name: "Mark done" })
    .click();
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);

  // Restore the prior setting through the settings UI.
  await page.goto("/settings");
  if (!wasOn) {
    const restoreToggle = page.getByRole("switch", {
      name: "Hide Completed Tasks",
    });
    await restoreToggle.click();
    await expect(restoreToggle).toHaveAttribute("aria-checked", "false");
  }

  // With the setting off the completed task is back; with it on it stays hidden.
  await page.goto("/");
  await expect(page.getByText(title, { exact: true })).toHaveCount(
    wasOn ? 0 : 1,
  );
});