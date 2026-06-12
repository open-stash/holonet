// Browser → probe (connectors / Notion sync) API client. Mirrors kyber.ts:
// probe verifies sentinel's RS256 JWT directly, so we send the access token as a
// Bearer header and retry once on 401 after refreshing.
import { getToken, refreshAccessToken } from "./token";

const BASE = process.env.NEXT_PUBLIC_PROBE_API_URL ?? "http://localhost:8084";
const V1 = `${BASE}/api/v1`;

export type ConnectorStatus =
  | "connected"
  | "syncing"
  | "needs_reauth"
  | "error";

export interface Connector {
  id: string;
  provider: string;
  status: ConnectorStatus | string;
  workspace_name?: string;
  last_sync_at?: string | null;
  last_error?: string;
  created_at: string;
}

function buildHeaders(token: string, extra: HeadersInit = {}): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function probeFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${V1}${path}`;
  const token = getToken();

  let res = await fetch(url, {
    ...options,
    headers: buildHeaders(token, options.headers as HeadersInit),
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      localStorage.removeItem("access_token");
      throw new Error("session_expired");
    }
    res = await fetch(url, {
      ...options,
      headers: buildHeaders(newToken, options.headers as HeadersInit),
    });
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `probe: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const probeApi = {
  listConnectors: () => probeFetch<Connector[]>("/connectors"),
  startNotionConnect: () =>
    probeFetch<{ authorize_url: string }>("/connectors/notion/connect"),
  syncNow: (id: string) =>
    probeFetch<{ status: string }>(`/connectors/${id}/sync`, { method: "POST" }),
  disconnect: (id: string, purge: boolean) =>
    probeFetch<{ status: string }>(
      `/connectors/${id}?purge=${purge ? "true" : "false"}`,
      { method: "DELETE" },
    ),
};
