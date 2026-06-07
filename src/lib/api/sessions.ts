// Session / device management — talks to sentinel's protected /auth/sessions
// endpoints through the Next proxy, sending the Bearer access token (with a
// single refresh-retry on 401).
import { getToken, refreshAccessToken } from "./token";

export interface SessionInfo {
  id: string;
  current: boolean;
  device: string;
  browser: string;
  os: string;
  created_at: string;
  last_seen: string;
}

const BASE = "/api/proxy/api/v1/auth";

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

export async function getSessions(): Promise<SessionInfo[]> {
  const res = await authed("/sessions");
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? "Could not load sessions");
  }
  return (json.data?.sessions ?? []) as SessionInfo[];
}

export async function revokeSession(id: string): Promise<void> {
  const res = await authed(`/sessions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Could not sign out that device");
}

export async function revokeOtherSessions(): Promise<void> {
  const res = await authed("/sessions", { method: "DELETE" });
  if (!res.ok) throw new Error("Could not sign out other devices");
}
