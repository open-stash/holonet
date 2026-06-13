// holocron — AI chat / retrieval service. Like kyber, it verifies sentinel's JWT
// directly, so the browser calls it with a Bearer token and streams the answer back
// over Server-Sent Events (status → tokens → sources → done).
import { getToken, refreshAccessToken } from "./token";

const BASE = process.env.NEXT_PUBLIC_HOLOCRON_API_URL ?? "http://localhost:8083";
const CHAT_URL = `${BASE}/api/v1/chat`;

export interface ChatHistoryTurn {
  role: "user" | "assistant";
  content: string;
}

// Where chat retrieval looks. "best" = stash + memory + connections (default).
export type SearchScope = "best" | "stash" | "memory";

export interface Citation {
  source_id: string;
  title: string;
  type: string;
  url?: string;
  snippet?: string;
  origin?: "stash" | "memory" | "graph";
}

export interface StreamHandlers {
  onStatus?: (message: string) => void;
  onToken?: (text: string) => void;
  onSources?: (citations: Citation[]) => void;
  onDone?: (intent: string) => void;
  onError?: (message: string) => void;
}

function post(token: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  return fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });
}

function dispatch(event: string, data: string, handlers: StreamHandlers): void {
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(data);
  } catch {
    return;
  }
  switch (event) {
    case "status":
      handlers.onStatus?.(String(payload.message ?? ""));
      break;
    case "token":
      handlers.onToken?.(String(payload.text ?? ""));
      break;
    case "sources":
      handlers.onSources?.((payload.citations as Citation[]) ?? []);
      break;
    case "done":
      handlers.onDone?.(String(payload.intent ?? ""));
      break;
    case "error":
      handlers.onError?.(String(payload.message ?? "something went wrong"));
      break;
  }
}

// Parse a buffer of SSE text into complete `event:`/`data:` frames (separated by a
// blank line). Returns any trailing partial frame so it can be prepended next read.
function drainFrames(buffer: string, handlers: StreamHandlers): string {
  const frames = buffer.split("\n\n");
  const remainder = frames.pop() ?? "";
  for (const frame of frames) {
    let event = "message";
    const dataLines: string[] = [];
    for (const line of frame.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length > 0) dispatch(event, dataLines.join("\n"), handlers);
  }
  return remainder;
}

/**
 * Stream a chat answer from holocron. Resolves when the stream ends; rejects only on
 * a hard transport failure (network/abort) — server-side problems arrive as an
 * `error` event via `handlers.onError`.
 */
export async function streamChat(
  body: { message: string; history: ChatHistoryTurn[]; scope?: SearchScope },
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  let token = getToken();
  let res = await post(token, body, signal);

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      localStorage.removeItem("access_token");
      throw new Error("session_expired");
    }
    token = refreshed;
    res = await post(token, body, signal);
  }

  if (!res.ok || !res.body) {
    throw new Error(`holocron: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = drainFrames(buffer, handlers);
  }
}
