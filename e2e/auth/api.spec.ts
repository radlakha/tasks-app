import { test, expect } from "@playwright/test";
import {
  createAuthenticatedRequestContext,
  createTestUser,
  deleteAuthUsersByEmail,
} from "../helpers/auth";
import { cleanupFeatureRows } from "../helpers/db";
import { makeMarker } from "../helpers/marker";

const FEATURE = "auth";

const createdUsers: string[] = [];

test.afterAll(async () => {
  await deleteAuthUsersByEmail(createdUsers);
  await cleanupFeatureRows("tasks", FEATURE, "title");
});

test("A1 GET /api/tasks without a token is 401", async ({ request }) => {
  const res = await request.get("/api/tasks");
  expect(res.status()).toBe(401);
});

test("A2 POST /api/tasks without a token is 401 and creates nothing", async ({
  request,
  playwright,
}) => {
  const title = `${makeMarker(FEATURE)} unauthenticated POST`;

  const res = await request.post("/api/tasks", { data: { title } });
  expect(res.status()).toBe(401);

  const api = await createAuthenticatedRequestContext(
    playwright.request,
    createdUsers,
  );
  try {
    const list = await api.get("/api/tasks?scope=all");
    expect(list.status()).toBe(200);
    const tasks = (await list.json()) as { title: string }[];
    expect(tasks.some((task) => task.title === title)).toBe(false);
  } finally {
    await api.dispose();
  }
});

test("A3 PATCH /api/tasks/:id without a token is 401 and changes nothing", async ({
  request,
  playwright,
}) => {
  const marker = makeMarker(FEATURE);
  const original = `${marker} patch target`;

  const api = await createAuthenticatedRequestContext(
    playwright.request,
    createdUsers,
  );
  try {
    const created = (await (
      await api.post("/api/tasks", { data: { title: original } })
    ).json()) as { id: string; priority: string };

    const res = await request.patch(`/api/tasks/${created.id}`, {
      data: { title: `${marker} tampered`, priority: "high" },
    });
    expect(res.status()).toBe(401);

    const list = await api.get("/api/tasks?scope=all");
    expect(list.status()).toBe(200);
    const tasks = (await list.json()) as {
      id: string;
      title: string;
      priority: string;
    }[];
    const found = tasks.find((task) => task.id === created.id);
    expect(found?.title).toBe(original);
    expect(found?.priority).toBe("medium");
  } finally {
    await api.dispose();
  }
});

test("A4 GET and PATCH /api/settings without a token are 401", async ({
  request,
}) => {
  const getRes = await request.get("/api/settings");
  expect(getRes.status()).toBe(401);

  const patchRes = await request.patch("/api/settings", {
    data: { theme: "dark" },
  });
  expect(patchRes.status()).toBe(401);
});

test("A5 a garbage bearer token is 401, not 500", async ({ request }) => {
  const res = await request.get("/api/tasks", {
    headers: { Authorization: "Bearer not-a-real-token" },
  });
  expect(res.status()).toBe(401);
});

test("A6 GET /api/me without or with a garbage token is 401", async ({
  request,
}) => {
  const noToken = await request.get("/api/me");
  expect(noToken.status()).toBe(401);

  const garbage = await request.get("/api/me", {
    headers: { Authorization: "Bearer not-a-real-token" },
  });
  expect(garbage.status()).toBe(401);
});

test("A7 GET /api/me with a valid token returns the caller", async ({
  request,
}) => {
  const { email, accessToken } = await createTestUser();
  createdUsers.push(email);

  const res = await request.get("/api/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(res.status()).toBe(200);

  const body = (await res.json()) as { id: string; email: string };
  expect(body).toEqual({ id: expect.any(String), email });
});

test("A8 each user's token yields their own identity", async ({ request }) => {
  const userA = await createTestUser();
  const userB = await createTestUser();
  createdUsers.push(userA.email, userB.email);

  const resA = await request.get("/api/me", {
    headers: { Authorization: `Bearer ${userA.accessToken}` },
  });
  const resB = await request.get("/api/me", {
    headers: { Authorization: `Bearer ${userB.accessToken}` },
  });
  expect(resA.status()).toBe(200);
  expect(resB.status()).toBe(200);

  const bodyA = (await resA.json()) as { id: string; email: string };
  const bodyB = (await resB.json()) as { id: string; email: string };
  expect(bodyA).toEqual({ id: userA.id, email: userA.email });
  expect(bodyB).toEqual({ id: userB.id, email: userB.email });
  expect(bodyA.id).not.toBe(bodyB.id);
  expect(bodyA.email).not.toBe(bodyB.email);
});

test("A12 GET and PATCH /api/settings with a valid token still work", async ({
  playwright,
}) => {
  const api = await createAuthenticatedRequestContext(
    playwright.request,
    createdUsers,
  );
  try {
    const getRes = await api.get("/api/settings");
    expect(getRes.status()).toBe(200);
    const before = (await getRes.json()) as {
      hide_completed_tasks: boolean;
      theme: "light" | "dark";
    };
    expect(before).toHaveProperty("hide_completed_tasks");
    expect(before).toHaveProperty("theme");

    const toggled = before.theme === "dark" ? "light" : "dark";
    const patchRes = await api.patch("/api/settings", {
      data: { theme: toggled },
    });
    expect(patchRes.status()).toBe(200);
    expect(
      ((await patchRes.json()) as { theme: "light" | "dark" }).theme,
    ).toBe(toggled);

    const restore = await api.patch("/api/settings", {
      data: { theme: before.theme },
    });
    expect(restore.status()).toBe(200);
  } finally {
    await api.dispose();
  }
});