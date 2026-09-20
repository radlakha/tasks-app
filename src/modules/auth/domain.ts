import type { AuthUser } from "./types";
import * as dal from "./dal";

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

export async function getCurrentUser(): Promise<AuthUser | null> {
  return dal.getAuthenticatedUser();
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<string | null> {
  const { error } = await dal.signInWithPassword(input.email, input.password);
  if (error) {
    return INVALID_CREDENTIALS_MESSAGE;
  }
  return null;
}

export async function signUp(input: {
  email: string;
  password: string;
}): Promise<string | null> {
  const { error } = await dal.signUpWithPassword(input.email, input.password);
  if (error) {
    return error.message;
  }
  return null;
}

export async function signOut(): Promise<void> {
  const { error } = await dal.signOut();
  if (error) {
    throw new Error(error.message);
  }
}