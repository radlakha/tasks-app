"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn, signOut, signUp } from "./domain";

export type AuthFormState = { error?: string } | undefined;

function readCredentials(formData: FormData): {
  email: string;
  password: string;
} {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signInAction(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  const error = await signIn({ email, password });
  if (error) {
    return { error };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUpAction(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  const error = await signUp({ email, password });
  if (error) {
    return { error };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction() {
  await signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}