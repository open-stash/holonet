import type { Collection, Source } from "@/types/kyber";
import { getToken, refreshAccessToken } from "./token";

const BASE = process.env.NEXT_PUBLIC_KYBER_API_URL ?? "http://localhost:8081";
const V1 = `${BASE}/api/v1`;

function buildHeaders(token: string, extra: HeadersInit = {}): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function kyberFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${V1}${path}`;
  let token = getToken();

  let res = await fetch(url, {
    ...options,
    headers: buildHeaders(token, options.headers as HeadersInit),
  });

  // On 401, try refreshing the access token once and retry
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
    throw new Error(body.error ?? `kyber: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Collections ───────────────────────────────────────────────────────────────

export async function getCollections(): Promise<Collection[]> {
  return kyberFetch<Collection[]>("/collections");
}

export async function createCollection(name: string): Promise<Collection> {
  return kyberFetch<Collection>("/collections", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateCollection(id: string, name: string): Promise<Collection> {
  return kyberFetch<Collection>(`/collections/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<Collection> {
  return kyberFetch<Collection>(`/collections/${id}/favorite`, {
    method: "PATCH",
    body: JSON.stringify({ is_favorite: isFavorite }),
  });
}

export async function deleteCollection(id: string): Promise<void> {
  await kyberFetch<{ status: string }>(`/collections/${id}`, { method: "DELETE" });
}

export async function restoreCollection(id: string): Promise<void> {
  await kyberFetch<{ status: string }>(`/collections/${id}/restore`, { method: "PATCH" });
}

export async function getBinCollections(): Promise<Collection[]> {
  return kyberFetch<Collection[]>("/collections/bin");
}

export async function permanentDeleteCollection(id: string): Promise<void> {
  await kyberFetch<{ status: string }>(`/collections/${id}/permanent`, { method: "DELETE" });
}

// ── Sources ─────────────────────────────────────────────────────────────────

export async function createSource(input: {
  collection_id: string;
  type: "link" | "note";
  original_url?: string;
  content?: string;
}): Promise<Source> {
  return kyberFetch<Source>("/sources", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface PaginatedSources {
  items: Source[];
  total: number;
}

export async function getSourcesByCollection(
  collectionId: string,
  limit: number,
  offset: number
): Promise<PaginatedSources> {
  const res = await kyberFetch<{ items: Source[] | null; total: number }>(
    `/sources/collection/${collectionId}?limit=${limit}&offset=${offset}`
  );
  return { items: res.items ?? [], total: res.total ?? 0 };
}

export async function deleteSource(id: string, type: string): Promise<void> {
  await kyberFetch<{ status: string }>(`/sources/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ type }),
  });
}

export async function moveSource(id: string, collectionId: string): Promise<Source> {
  return kyberFetch<Source>(`/sources/${id}/collection`, {
    method: "PATCH",
    body: JSON.stringify({ collection_id: collectionId }),
  });
}

// ── Upload (files) ───────────────────────────────────────────────────────────

interface PresignResponse {
  source_id: string;
  upload_url: string;
  s3_key: string;
  expires_at: string;
}

export async function presignUpload(input: {
  filename: string;
  content_type: string;
  collection_id: string;
  title: string;
  size: number;
}): Promise<PresignResponse> {
  return kyberFetch<PresignResponse>("/upload/presign", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Raw PUT straight to DigitalOcean Spaces — NOT through kyber (no auth header).
// Content-Type must match what was signed in the presign request.
export async function uploadFileToS3(
  url: string,
  file: File,
  contentType: string
): Promise<void> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`upload failed: ${res.status}`);
  }
}

export async function confirmUpload(sourceId: string): Promise<void> {
  await kyberFetch<{ status: string }>(`/upload/${sourceId}/confirm`, {
    method: "POST",
  });
}
