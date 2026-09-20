import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) return auth.response;

  return NextResponse.json(auth.user);
}