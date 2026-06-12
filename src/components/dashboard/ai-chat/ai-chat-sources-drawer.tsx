"use client";

import { useState } from "react";
import { ExternalLink, FileText, Link2, StickyNote } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Citation } from "./ai-chat-types";
import { cn } from "@/lib/utils";
import { useChatStore } from "@source/stores";

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

function SourceFavicon({ citation }: { citation: Citation }) {
  const [imgError, setImgError] = useState(false);
  const Icon = typeIcon[citation.type] ?? FileText;
  const host = hostFromUrl(citation.url);
  const favicon = host
    ? `https://www.google.com/s2/favicons?sz=64&domain=${host}`
    : null;

  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
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
    </span>
  );
}

function SourceDrawerItem({ citation }: { citation: Citation }) {
  const host = hostFromUrl(citation.url);
  const subtitle = host
    ? `${host} · ${typeLabel(citation.type)}`
    : typeLabel(citation.type);
  const snippet = citation.snippet?.trim();
  const title = citation.title || "Untitled";

  function openSource() {
    if (citation.url) {
      window.open(citation.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={openSource}
      disabled={!citation.url}
      className={cn(
        "flex w-full gap-3 rounded-xl border border-transparent px-2 py-2.5 text-left transition",
        citation.url
          ? "cursor-pointer hover:border-slate-200 hover:bg-slate-50"
          : "cursor-default opacity-90"
      )}
    >
      <SourceFavicon citation={citation} />
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-1.5">
          <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {title}
          </span>
          {citation.url ? (
            <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
        {snippet ? (
          <span className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {snippet}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function AiChatSourcesDrawer() {
  const open = useChatStore((state) => state.sourcesDrawerOpen);
  const citations = useChatStore((state) => state.sourcesDrawerCitations);
  const closeSourcesDrawer = useChatStore((state) => state.closeSourcesDrawer);

  const count = citations.length;
  const label = `${count} ${count === 1 ? "source" : "sources"}`;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) closeSourcesDrawer();
      }}
    >
      <SheetContent
        side="right"
        className="flex h-full flex-col gap-0 border-slate-200/80 bg-white p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-slate-100 px-5 py-4">
          <SheetTitle className="text-base font-semibold tracking-tight">
            Sources
          </SheetTitle>
          <SheetDescription>
            {count > 0
              ? `${label} referenced in this reply. Click a title to open it.`
              : "No sources for this reply."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <div className="flex flex-col gap-0.5">
            {citations.map((citation) => (
              <SourceDrawerItem key={citation.source_id} citation={citation} />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
