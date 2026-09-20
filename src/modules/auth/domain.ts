import type { AuthUser } from "./types";
import * as dal from "./dal";

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "UnauthenticatedError";
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return dal.getAuthenticatedUser();
}

export async function getApiCaller(token: string | null): Promise<AuthUser> {
  if (!token) {
    throw new UnauthenticatedError();
  }
  try {
    return await dal.getUserByAccessToken(token);
  } catch {
    throw new UnauthenticatedError();
  }
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