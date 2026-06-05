import type { Citation } from "@/lib/api/holocron";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  // Assistant-only: live progress hint while retrieving, and the sources cited.
  status?: string;
  citations?: Citation[];
  // Assistant-only: true while the turn is still streaming — keeps the loader icon
  // pinned beneath the text until the response completes.
  pending?: boolean;
}

export function createChatMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export type { Citation };
