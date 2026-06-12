// API keys for external MCP clients — talks to sentinel's /keys endpoints through
// the Next proxy with the Bearer access token (single refresh-retry on 401).
import { getToken, refreshAccessToken } from "./token";

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  last_used_at: string | null;
  created_at: string;
}

export interface CreatedApiKey extends ApiKey {
  key: string; // plaintext — returned ONCE on creation
}

const BASE = "/api/proxy/api/v1/keys";

async function authed(path: string, options: RequestInit = {}): Promise<Response> {
  const doFetch = (token: string) =>
    fetch(`${BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let res = await doFetch(getToken());
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) res = await doFetch(refreshed);
  }
  return res;
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const res = await authed("");
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? "Could not load API keys");
  }
  return (json.data?.keys ?? []) as ApiKey[];
}

export async function createApiKey(name: string): Promise<CreatedApiKey> {
  const res = await authed("", { method: "POST", body: JSON.stringify({ name }) });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? "Could not create API key");
  }
  return json.data as CreatedApiKey;
}

export async function revokeApiKey(id: string): Promise<void> {
  const res = await authed(`/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Could not revoke API key");
}
