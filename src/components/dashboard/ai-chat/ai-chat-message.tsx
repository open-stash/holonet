"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { AiChatLoader } from "./ai-chat-loader";
import { MessageSourcesIndicator } from "./ai-chat-citation";
import { AiChatMarkdown } from "./ai-chat-markdown";
import type { ChatMessage } from "./ai-chat-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiChatMessageProps {
  message: ChatMessage;
  isLast?: boolean;
}

// The brand mark left beneath a finished reply. Static by default; clicking it replays
// a single squeeze cycle (remounting via `key` restarts the one-shot animation).
function ResultMark() {
  const [replay, setReplay] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setReplay((n) => n + 1)}
      aria-label="Play animation"
      className="mt-2 inline-flex"
    >
      <AiChatLoader
        key={replay}
        animation={replay === 0 ? "none" : "once"}
        className="h-7"
      />
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context) — silently ignore.
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy"}
      className="size-7 cursor-pointer text-muted-foreground"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}

export function AiChatMessage({ message, isLast = false }: AiChatMessageProps) {
  const isUser = message.role === "user";
  const isPending = !isUser && Boolean(message.pending);
  const hasContent = message.content.length > 0;

  // Pre-text phase: loader alone (no bubble) with the live status caption.
  if (isPending && !hasContent) {
    return (
      <div className="flex w-full flex-col items-start gap-1.5">
        <AiChatLoader />
        {message.status && (
          <span className="text-xs text-muted-foreground">{message.status}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex w-full flex-col",
        isUser ? "items-end" : "items-start"
      )}
    >
      {isUser ? (
        <div className="max-w-[85%] rounded-2xl bg-slate-100 px-4 py-2.5 text-sm leading-relaxed text-foreground">
          <span className="whitespace-pre-wrap">{message.content}</span>
        </div>
      ) : (
        // Assistant: markdown with [1]-style citation numbers left in the text.
        <AiChatMarkdown content={message.content} className="max-w-[85%]" />
      )}

      {/* Streaming tail: the loader stays pinned below the text until the turn ends. */}
      {isPending && hasContent && <AiChatLoader className="mt-2 h-7" />}

      {/* Completed assistant reply: copy + sources drawer (footer) */}
      {!isUser && !isPending && hasContent && (
        <>
          <div className="mt-1 flex w-full max-w-[85%] items-center gap-1">
            <CopyButton text={message.content} />
            {message.citations && message.citations.length > 0 ? (
              <MessageSourcesIndicator citations={message.citations} />
            ) : null}
          </div>
          {isLast && <ResultMark />}
        </>
      )}
    </div>
  );
}
