import { create } from "zustand";
import {
  createChatMessage,
  type ChatMessage,
  type Citation,
} from "@/components/dashboard/ai-chat/ai-chat-types";
import {
  streamChat,
  type ChatHistoryTurn,
  type SearchScope,
} from "@/lib/api/holocron";

const HISTORY_TURNS = 6;

// Typewriter pacing. Gemini streams in coarse chunks (often the whole short reply in
// one delta), so we buffer incoming text and reveal it gradually for a smooth feel.
// Revealing a proportional slice each tick bounds total reveal time (~TICK_MS * 50)
// regardless of chunk size, and keeps pace when more chunks arrive mid-reveal.
const TICK_MS = 16;
const REVEAL_DIVISOR = 50;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The in-flight stream's AbortController. Kept outside reactive state — it's a handle,
// not something the UI renders. Only one turn streams at a time.
let activeController: AbortController | null = null;

interface ChatStore {
  messages: ChatMessage[];
  isReplying: boolean;
  scope: SearchScope;
  sourcesDrawerOpen: boolean;
  sourcesDrawerCitations: Citation[];

  setScope: (scope: SearchScope) => void;
  sendMessage: (text: string) => Promise<void>;
  stopGeneration: () => void;
  newChat: () => void;
  openSourcesDrawer: (citations: Citation[]) => void;
  closeSourcesDrawer: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isReplying: false,
  scope: "best",
  sourcesDrawerOpen: false,
  sourcesDrawerCitations: [],

  setScope: (scope) => set({ scope }),

  openSourcesDrawer: (citations) =>
    set({ sourcesDrawerOpen: true, sourcesDrawerCitations: citations }),

  closeSourcesDrawer: () =>
    set({ sourcesDrawerOpen: false, sourcesDrawerCitations: [] }),

  sendMessage: async (text) => {
    const trimmed = text.trim();
    if (!trimmed || get().isReplying) return;

    const history: ChatHistoryTurn[] = get()
      .messages.slice(-HISTORY_TURNS)
      .map((m) => ({ role: m.role, content: m.content }));

    const userMessage = createChatMessage("user", trimmed);
    const assistant = createChatMessage("assistant", "");
    assistant.status = "Thinking…";
    assistant.pending = true; // keeps the loader icon visible through streaming
    set((s) => ({
      messages: [...s.messages, userMessage, assistant],
      isReplying: true,
    }));

    const patch = (changes: Partial<ChatMessage>) =>
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistant.id ? { ...m, ...changes } : m
        ),
      }));

    const setContent = (content: string) =>
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistant.id ? { ...m, content, status: undefined } : m
        ),
      }));

    const controller = new AbortController();
    activeController = controller;

    // Smoothing buffer: onToken fills `pending`, the typewriter reveals it char-group
    // by char-group so the answer animates even when it arrives as one big chunk.
    let pending = "";
    let shown = "";
    let streamEnded = false;
    let stopped = false;

    const typewriter = (async () => {
      while ((!streamEnded || pending.length > 0) && !stopped) {
        if (pending.length === 0) {
          await sleep(TICK_MS);
          continue;
        }
        const step = Math.max(1, Math.ceil(pending.length / REVEAL_DIVISOR));
        shown += pending.slice(0, step);
        pending = pending.slice(step);
        setContent(shown);
        await sleep(TICK_MS);
      }
    })();

    try {
      await streamChat(
        { message: trimmed, history, scope: get().scope },
        {
          onStatus: (message) => patch({ status: message }),
          onToken: (token) => {
            pending += token;
          },
          onSources: (citations) => patch({ citations }),
          onError: (message) => {
            stopped = true;
            pending = "";
            setContent(
              message === "session_expired"
                ? "Your session expired — please sign in again."
                : "Sorry, I hit a problem answering that. Please try again."
            );
          },
        },
        controller.signal
      );
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      stopped = true;
      if (aborted) {
        // User pressed stop: keep what's shown, drop an empty placeholder.
        set((s) => ({
          messages: s.messages
            .map((m) => (m.id === assistant.id ? { ...m, status: undefined } : m))
            .filter((m) => !(m.id === assistant.id && m.content === "")),
        }));
      } else {
        setContent("I couldn't reach the assistant. Please try again.");
      }
    } finally {
      streamEnded = true;
      await typewriter; // drain any remaining buffered text before finishing
      if (activeController === controller) activeController = null;
      // Clear pending → the loader icon disappears now that the turn is done.
      set((s) => ({
        isReplying: false,
        messages: s.messages.map((m) =>
          m.id === assistant.id ? { ...m, pending: false } : m
        ),
      }));
    }
  },

  stopGeneration: () => {
    activeController?.abort();
  },

  newChat: () => {
    activeController?.abort();
    set({
      messages: [],
      isReplying: false,
      sourcesDrawerOpen: false,
      sourcesDrawerCitations: [],
    });
  },
}));
