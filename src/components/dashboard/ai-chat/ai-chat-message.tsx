"use client";

import { useState } from "react";
import { Check, Copy, FileText, Link2, StickyNote } from "lucide-react";
import { AiChatLoader } from "./ai-chat-loader";
import { AiChatMarkdown } from "./ai-chat-markdown";
import type { ChatMessage, Citation } from "./ai-chat-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiChatMessageProps {
  message: ChatMessage;
  isLast?: boolean;
}

const typeIcon: Record<string, typeof Link2> = {
  link: Link2,
  note: StickyNote,
};

function hostFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function typeLabel(type: string): string {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Source";
}

// A real source card: favicon (for links) or type icon, title, and domain/type.
function SourceCard({ citation }: { citation: Citation }) {
  const [imgError, setImgError] = useState(false);
  const Icon = typeIcon[citation.type] ?? FileText;
  const host = hostFromUrl(citation.url);
  const favicon = host
    ? `https://www.google.com/s2/favicons?sz=64&domain=${host}`
    : null;
  const subtitle = host ? `${host} · ${typeLabel(citation.type)}` : typeLabel(citation.type);

  const card = (
    <div className="flex w-[14rem] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
        {favicon && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={favicon}
            alt=""
            width={20}
            height={20}
            className="size-5"
            onError={() => setImgError(true)}
          />
        ) : (
          <Icon className="size-4 text-slate-500" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {citation.title || "Untitled"}
        </p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );

  return citation.url ? (
    <a href={citation.url} target="_blank" rel="noopener noreferrer" className="block">
      {card}
    </a>
  ) : (
    card
  );
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
        // Assistant: borderless rendered markdown, Claude-style.
        <AiChatMarkdown content={message.content} className="max-w-[85%]" />
      )}

      {/* Streaming tail: the loader stays pinned below the text until the turn ends. */}
      {isPending && hasContent && <AiChatLoader className="mt-2 h-7" />}

      {!isUser && message.citations && message.citations.length > 0 && (
        <div className="mt-3 w-full max-w-[85%]">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            {message.citations.length === 1
              ? "Source"
              : `${message.citations.length} Sources`}
          </p>
          <div className="flex flex-wrap gap-2">
            {message.citations.map((citation) => (
              <SourceCard key={citation.source_id} citation={citation} />
            ))}
          </div>
        </div>
      )}

      {/* Completed assistant reply: copy action (all replies) + the brand mark, which
          stays only on the latest reply so it moves down as the chat grows. */}
      {!isUser && !isPending && hasContent && (
        <>
          <div className="mt-1">
            <CopyButton text={message.content} />
          </div>
          {isLast && <ResultMark />}
        </>
      )}
    </div>
  );
}
