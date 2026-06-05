// Shared access-token helpers for browser → service calls (kyber, holocron).
// These services verify sentinel's RS256 JWT directly, so the browser sends the
// access token as a Bearer header (read from localStorage after login).

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("access_token") ?? "";
}

// Shared in-flight refresh promise — ensures only one refresh call is made even
// when multiple fetches 401 simultaneously. Sentinel rotates refresh tokens, so
// concurrent refresh calls would invalidate each other.
let refreshInFlight: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch("/api/proxy/api/v1/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const json = await res.json().catch(() => null);
      if (!json?.success || !json.data?.access_token) return null;
      localStorage.setItem("access_token", json.data.access_token);
      return json.data.access_token as string;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
