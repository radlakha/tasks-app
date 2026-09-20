import { createClient } from "@/lib/supabase/server";
import type { AuthUser } from "./types";

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email: string, password: string) {
  const supabase = await createClient();
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  const supabase = await createClient();
  return supabase.auth.signOut();
}