import { getLocalSupabaseEnv } from "./supabase";

interface RestClient {
  url: string;
  key: string;
}

let cached: RestClient | null = null;

function client(): RestClient {
  if (!cached) {
    const env = getLocalSupabaseEnv();
    cached = { url: env.apiUrl, key: env.anonKey };
  }
  return cached;
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const { url, key } = client();
  return fetch(`${url}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export async function cleanupFeatureRows(
  table: string,
  feature: string,
  column = "title",
): Promise<void> {
  const pattern = `[atd:${feature}]%`;
  const res = await request(
    `/${table}?${column}=like.${encodeURIComponent(pattern)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(
      `cleanupFeatureRows(${table}, ${feature}) failed (${res.status}): ${await res.text()}`,
    );
  }
}

export async function fetchSingleRow<T>(
  table: string,
  idColumn: string,
  id: string | number,
): Promise<T | null> {
  const res = await request(
    `/${table}?${idColumn}=eq.${encodeURIComponent(String(id))}&select=*`,
  );
  if (!res.ok) {
    throw new Error(`fetchSingleRow(${table}) failed (${res.status})`);
  }
  const rows = (await res.json()) as T[];
  return rows[0] ?? null;
}

export async function updateRow(
  table: string,
  idColumn: string,
  id: string | number,
  data: Record<string, unknown>,
): Promise<void> {
  const res = await request(
    `/${table}?${idColumn}=eq.${encodeURIComponent(String(id))}`,
    { method: "PATCH", body: JSON.stringify(data) },
  );
  if (!res.ok) {
    throw new Error(`updateRow(${table}) failed (${res.status}): ${await res.text()}`);
  }
}