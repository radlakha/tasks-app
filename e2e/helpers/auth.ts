import { createClient } from "@supabase/supabase-js";
import type { APIRequest, APIRequestContext } from "@playwright/test";
import { getLocalSupabaseEnv } from "./supabase";

const AUTH_EMAIL_MARKER = /^atd-auth-[a-z0-9-]+@example\.com$/;
const AUTH_TEST_PASSWORD = "atd-auth-password-01!";

export function makeAuthUserEmail(): string {
  return `atd-auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export interface TestUser {
  email: string;
  id: string;
  accessToken: string;
}

export async function createTestUser(): Promise<TestUser> {
  const email = makeAuthUserEmail();
  const { apiUrl, anonKey } = getLocalSupabaseEnv();
  const client = createClient(apiUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await client.auth.signUp({
    email,
    password: AUTH_TEST_PASSWORD,
  });
  if (error) {
    throw new Error(`signUp(${email}) failed: ${error.message}`);
  }
  if (!data.session?.access_token || !data.user) {
    throw new Error(`signUp(${email}) returned no session`);
  }

  return { email, id: data.user.id, accessToken: data.session.access_token };
}

export async function createAuthenticatedRequestContext(
  request: APIRequest,
  emails: string[],
): Promise<APIRequestContext> {
  const { email, accessToken } = await createTestUser();
  emails.push(email);
  return request.newContext({
    extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function deleteAuthUsersByEmail(emails: string[]): Promise<void> {
  const marked = [...new Set(emails)].filter((email) =>
    AUTH_EMAIL_MARKER.test(email),
  );
  if (marked.length === 0) return;

  const { apiUrl, serviceRoleKey } = getLocalSupabaseEnv();
  const client = createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await client.auth.admin.listUsers();
  if (error) throw new Error(`listUsers failed: ${error.message}`);

  const idByEmail = new Map(
    data.users.map((user) => [user.email, user.id]),
  );
  for (const email of marked) {
    const id = idByEmail.get(email);
    if (!id) continue;
    const { error: deleteError } = await client.auth.admin.deleteUser(id);
    if (deleteError) {
      throw new Error(`deleteUser(${email}) failed: ${deleteError.message}`);
    }
  }
}