// Connected apps (OAuth) — apps the user connected TO their OpenStash memory (ChatGPT,
// Claude, …). Talks to sentinel's /connections endpoints through the Next proxy.
import { getToken, refreshAccessToken } from "./token";

export interface ConnectedApp {
  client_id: string;
  name: string;
  connected_at: string;
  last_active_at: string;
}

const BASE = "/api/proxy/api/v1/connections";

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

export async function listConnectedApps(): Promise<ConnectedApp[]> {
  const res = await authed("");
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? "Could not load connected apps");
  }
  return (json.data?.connections ?? []) as ConnectedApp[];
}

export async function disconnectApp(clientId: string): Promise<void> {
  const res = await authed(`/${encodeURIComponent(clientId)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Could not disconnect app");
}
