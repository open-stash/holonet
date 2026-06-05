import { SentinelSuccess } from "@/types/auth";

// Always route through the Next.js proxy — keeps SENTINEL_API_URL server-only.
// Works as a relative URL from the browser (all our API callers are "use client").
const BASE_URL = "/api/proxy";

// Thrown whenever sentinel returns { success: false }
export class SentinelApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "SentinelApiError";
  }
}

export async function sentinelFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<SentinelSuccess<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include", // carry refresh_token HttpOnly cookie
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  // sentinel always returns JSON
  const json = await res.json();

  if (!json.success) {
    throw new SentinelApiError(
      json.error ?? "Something went wrong. Please try again.",
      res.status
    );
  }

  return json as SentinelSuccess<T>;
}
