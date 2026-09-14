import { test, expect } from "@playwright/test";
import { cleanupFeatureRows } from "../helpers/db";
import { makeMarker } from "../helpers/marker";

const FEATURE = "tasks";

test.afterAll(async () => {
  await cleanupFeatureRows("tasks", FEATURE, "title");
});

test("GET /api/tasks rejects an invalid scope with 400", async ({ request }) => {
  const res = await request.get("/api/tasks?scope=bogus");
  expect(res.status()).toBe(400);
});

test("POST /api/tasks creates a task listed under all and active scopes", async ({
  request,
}) => {
  const marker = makeMarker(FEATURE);
  const title = `${marker} created via API`;

  const created = await request.post("/api/tasks", { data: { title } });
  expect(created.status()).toBe(201);
  const task = (await created.json()) as { id: string };

  for (const scope of ["all", "active"] as const) {
    const res = await request.get(`/api/tasks?scope=${scope}`);
    expect(res.status()).toBe(200);
    const tasks = (await res.json()) as { id: string; title: string }[];
    expect(tasks.find((t) => t.id === task.id)?.title).toBe(title);
  }
});

test("POST /api/tasks rejects a whitespace-only title with 400", async ({
  request,
}) => {
  const res = await request.post("/api/tasks", { data: { title: "   " } });
  expect(res.status()).toBe(400);
});