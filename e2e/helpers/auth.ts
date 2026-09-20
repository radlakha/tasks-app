import { createClient } from "@supabase/supabase-js";
import { getLocalSupabaseEnv } from "./supabase";

const AUTH_EMAIL_MARKER = /^atd-auth-[a-z0-9-]+@example\.com$/;

export function makeAuthUserEmail(): string {
  return `atd-auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
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