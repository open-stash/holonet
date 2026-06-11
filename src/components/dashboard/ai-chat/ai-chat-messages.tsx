"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownIcon } from "lucide-react";
import { AiChatMessage } from "./ai-chat-message";
import type { ChatMessage } from "./ai-chat-types";
import { cn } from "@/lib/utils";

interface AiChatMessagesProps {
  messages: ChatMessage[];
  isReplying: boolean;
}

// How close to the bottom (px) still counts as "pinned" — leaves room so a
// streaming line that grows by a row doesn't unpin the view.
const BOTTOM_THRESHOLD = 80;

export function AiChatMessages({ messages, isReplying }: AiChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Whether the view is pinned to the bottom. A ref drives the follow logic
  // (no stale closures, no re-render churn while streaming); state only toggles
  // the jump button.
  const pinnedRef = useRef(true);
  const prevCount = useRef(messages.length);
  const [showJump, setShowJump] = useState(false);

  const syncPinned = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const pinned = distanceFromBottom <= BOTTOM_THRESHOLD;
    pinnedRef.current = pinned;
    setShowJump(!pinned);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    pinnedRef.current = true;
    setShowJump(false);
  }, []);

  // Follow new content. Sending always snaps to the bottom — a brand-new *user*
  // message force-scrolls even if you'd scrolled up, so you see what you just sent
  // and the reply. Assistant messages and streaming tokens only follow while you're
  // already pinned, so scrolling up to read history isn't interrupted.
  useEffect(() => {
    const isNewMessage = messages.length !== prevCount.current;
    prevCount.current = messages.length;

    const sentByUser =
      isNewMessage && messages[messages.length - 1]?.role === "user";

    if (sentByUser || pinnedRef.current) {
      scrollToBottom(isNewMessage ? "smooth" : "auto");
    }
  }, [messages, isReplying, scrollToBottom]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={syncPinned}
        className="h-full overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
          {messages.map((message, i) => (
            <AiChatMessage
              key={message.id}
              message={message}
              isLast={i === messages.length - 1}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToBottom("smooth")}
        aria-label="Scroll to latest"
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition hover:text-foreground",
          showJump
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none translate-y-1 opacity-0",
        )}
      >
        <ArrowDownIcon className="size-4" />
      </button>
    </div>
  );
}
