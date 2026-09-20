import { NextResponse } from "next/server";
import { getApiCaller, UnauthenticatedError } from "@/modules/auth";
import type { AuthUser } from "@/modules/auth";
import { jsonError } from "@/lib/http";

export async function requireApiUser(
  request: Request,
): Promise<{ user: AuthUser } | { response: NextResponse }> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1] ?? null;

  try {
    const user = await getApiCaller(token);
    return { user };
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return { response: jsonError(error, 401) };
    }
    throw error;
  }
}