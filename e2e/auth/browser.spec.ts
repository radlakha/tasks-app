import { expect, test, type Page } from "@playwright/test";
import { deleteAuthUsersByEmail, makeAuthUserEmail } from "../helpers/auth";

test.describe.configure({ mode: "serial" });

const createdEmails: string[] = [];

test.afterAll(async () => {
  await deleteAuthUsersByEmail(createdEmails).catch(() => undefined);
});

async function signUpViaUi(page: Page, email: string, password: string) {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL("/");
  createdEmails.push(email);
}

test("a new user can sign up and is identified", async ({ page }) => {
  const email = makeAuthUserEmail();
  const password = "correct-horse-battery-staple";

  await signUpViaUi(page, email, password);

  await expect(page.locator("header")).toContainText(email);
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("an existing user can sign in after signing out", async ({ page }) => {
  const email = makeAuthUserEmail();
  const password = "correct-horse-battery-staple";

  await signUpViaUi(page, email, password);
  await expect(page.locator("header")).toContainText(email);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.locator("header")).toContainText(email);
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("an invalid email/password combination is rejected with a clear error", async ({
  page,
}) => {
  const email = makeAuthUserEmail();
  const password = "not-the-password";

  createdEmails.push(email);
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/login");
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
  await expect(page.locator("header")).not.toContainText(email);
  await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(0);
});

test("after sign-out the user is no longer authenticated", async ({ page }) => {
  const email = makeAuthUserEmail();
  const password = "correct-horse-battery-staple";

  await signUpViaUi(page, email, password);
  await expect(page.locator("header")).toContainText(email);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/login");

  await page.reload();
  await expect(page.locator("header")).not.toContainText(email);
  await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(0);
});