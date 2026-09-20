import {
  test,
  expect,
  type APIRequestContext,
} from "@playwright/test";
import { cleanupFeatureRows } from "../helpers/db";
import { makeMarker } from "../helpers/marker";
import {
  createAuthenticatedRequestContext,
  deleteAuthUsersByEmail,
} from "../helpers/auth";

const FEATURE = "tasks";

let api: APIRequestContext;
const createdUsers: string[] = [];

test.beforeAll(async ({ playwright }) => {
  api = await createAuthenticatedRequestContext(playwright.request, createdUsers);
});

test.afterAll(async () => {
  await api?.dispose();
  await deleteAuthUsersByEmail(createdUsers);
  await cleanupFeatureRows("tasks", FEATURE, "title");
});

test("GET /api/tasks rejects an invalid scope with 400", async () => {
  const res = await api.get("/api/tasks?scope=bogus");
  expect(res.status()).toBe(400);
});

test("POST /api/tasks creates a task listed under all and active scopes", async () => {
  const marker = makeMarker(FEATURE);
  const title = `${marker} created via API`;

  const created = await api.post("/api/tasks", { data: { title } });
  expect(created.status()).toBe(201);
  const task = (await created.json()) as { id: string };

  for (const scope of ["all", "active"] as const) {
    const res = await api.get(`/api/tasks?scope=${scope}`);
    expect(res.status()).toBe(200);
    const tasks = (await res.json()) as { id: string; title: string }[];
    expect(tasks.find((t) => t.id === task.id)?.title).toBe(title);
  }
});

test("POST /api/tasks rejects a whitespace-only title with 400", async () => {
  const res = await api.post("/api/tasks", { data: { title: "   " } });
  expect(res.status()).toBe(400);
});

test("POST /api/tasks accepts and returns low, medium, and high priority", async () => {
  const created: Array<{ id: string; priority: string }> = [];

  for (const priority of ["low", "medium", "high"] as const) {
    const title = `${makeMarker(FEATURE)} ${priority} via API`;
    const res = await api.post("/api/tasks", {
      data: { title, priority },
    });
    expect(res.status()).toBe(201);
    const task = (await res.json()) as { id: string; priority: string };
    expect(task.priority).toBe(priority);
    created.push(task);
  }

  const res = await api.get("/api/tasks?scope=all");
  expect(res.status()).toBe(200);
  const tasks = (await res.json()) as { id: string; priority: string }[];
  for (const task of created) {
    expect(tasks.find((t) => t.id === task.id)?.priority).toBe(task.priority);
  }
});

test("POST /api/tasks without priority stays backward compatible and defaults to medium", async () => {
  const title = `${makeMarker(FEATURE)} v1 client via API`;

  const res = await api.post("/api/tasks", { data: { title } });
  expect(res.status()).toBe(201);
  expect((await res.json()) as { priority: string }).toMatchObject({
    title,
    priority: "medium",
  });
});

test("POST /api/tasks rejects an invalid priority with 400", async () => {
  const title = `${makeMarker(FEATURE)} invalid priority`;

  for (const priority of ["critical", 123]) {
    const res = await api.post("/api/tasks", { data: { title, priority } });
    expect(res.status()).toBe(400);
  }
});

test("PATCH /api/tasks/:id changes priority and returns it", async () => {
  const title = `${makeMarker(FEATURE)} priority change via API`;
  const created = (await (
    await api.post("/api/tasks", { data: { title } })
  ).json()) as { id: string; priority: string };
  expect(created.priority).toBe("medium");

  const high = await api.patch(`/api/tasks/${created.id}`, {
    data: { priority: "high" },
  });
  expect(high.status()).toBe(200);
  expect(((await high.json()) as { priority: string }).priority).toBe("high");

  const low = await api.patch(`/api/tasks/${created.id}`, {
    data: { priority: "low" },
  });
  expect(low.status()).toBe(200);
  expect(((await low.json()) as { priority: string }).priority).toBe("low");

  const res = await api.get("/api/tasks?scope=all");
  const tasks = (await res.json()) as { id: string; priority: string }[];
  expect(tasks.find((t) => t.id === created.id)?.priority).toBe("low");
});

test("PATCH /api/tasks/:id rejects an invalid priority with 400 and keeps the stored one", async () => {
  const title = `${makeMarker(FEATURE)} invalid patch via API`;
  const created = (await (
    await api.post("/api/tasks", { data: { title } })
  ).json()) as { id: string; priority: string };
  expect(created.priority).toBe("medium");

  for (const priority of ["critical", 17]) {
    const res = await api.patch(`/api/tasks/${created.id}`, {
      data: { priority },
    });
    expect(res.status()).toBe(400);
  }

  const list = await api.get("/api/tasks?scope=all");
  const tasks = (await list.json()) as { id: string; priority: string }[];
  expect(tasks.find((t) => t.id === created.id)?.priority).toBe("medium");
});

test("PATCH /api/tasks/:id with a title alone stays backward compatible", async () => {
  const marker = makeMarker(FEATURE);
  const original = `${marker} v1 patch via API`;
  const created = (await (
    await api.post("/api/tasks", { data: { title: original } })
  ).json()) as { id: string; priority: string };
  expect(created.priority).toBe("medium");

  const retitled = `${marker} retitled via API`;
  const res = await api.patch(`/api/tasks/${created.id}`, {
    data: { title: retitled },
  });
  expect(res.status()).toBe(200);
  const body = (await res.json()) as { title: string; priority: string };
  expect(body.title).toBe(retitled);
  expect(body.priority).toBe("medium");
});

test("PATCH /api/tasks/:id toggles completed and archived and returns them", async () => {
  const marker = makeMarker(FEATURE);
  const title = `${marker} completion via API`;
  const created = (await (
    await api.post("/api/tasks", { data: { title } })
  ).json()) as { id: string; completed: boolean; archived_at: string | null };
  expect(created.completed).toBe(false);
  expect(created.archived_at).toBeNull();

  const completed = await api.patch(`/api/tasks/${created.id}`, {
    data: { completed: true },
  });
  expect(completed.status()).toBe(200);
  expect((await completed.json()) as { completed: boolean }).toMatchObject({
    completed: true,
  });

  const uncompleted = await api.patch(`/api/tasks/${created.id}`, {
    data: { completed: false },
  });
  expect(uncompleted.status()).toBe(200);
  expect((await uncompleted.json()) as { completed: boolean }).toMatchObject({
    completed: false,
  });

  const archived = await api.patch(`/api/tasks/${created.id}`, {
    data: { archived: true },
  });
  expect(archived.status()).toBe(200);
  expect(
    (await archived.json()) as { archived_at: string | null },
  ).toMatchObject({ archived_at: expect.any(String) });

  const archivedList = await api.get("/api/tasks?scope=archived");
  expect(archivedList.status()).toBe(200);
  const archivedTasks = (await archivedList.json()) as {
    id: string;
  }[];
  expect(archivedTasks.some((t) => t.id === created.id)).toBe(true);

  const unarchived = await api.patch(`/api/tasks/${created.id}`, {
    data: { archived: false },
  });
  expect(unarchived.status()).toBe(200);
  expect(
    (await unarchived.json()) as { archived_at: string | null },
  ).toMatchObject({ archived_at: null });

  const allList = await api.get("/api/tasks?scope=all");
  expect(allList.status()).toBe(200);
  const allTasks = (await allList.json()) as { id: string }[];
  expect(allTasks.some((t) => t.id === created.id)).toBe(true);
});