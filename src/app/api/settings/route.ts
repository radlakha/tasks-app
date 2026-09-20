import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/modules/settings";
import type { ThemePreference } from "@/modules/settings";
import { jsonError } from "@/lib/http";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) return auth.response;

  try {
    return NextResponse.json(await getSettings());
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as {
      hide_completed_tasks?: boolean;
      theme?: ThemePreference;
    };
    const settings = await updateSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    return jsonError(error, 400);
  }
}
