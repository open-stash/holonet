"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Link2,
  StickyNote,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { Citation } from "./ai-chat-types";
import { cn } from "@/lib/utils";
import { useChatStore } from "@source/stores";

const typeIcon: Record<string, typeof Link2> = {
  link: Link2,
  note: StickyNote,
};

const SNIPPET_MAX = 160;
const MAX_STACKED_FAVICONS = 3;

const cardShadow =
  "shadow-[0_4px_24px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)]";

function hostFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function pillLabel(citation: Citation): string {
  const host = hostFromUrl(citation.url);
  if (host) {
    const segment = host.split(".")[0];
    return segment || host;
  }
  return typeLabel(citation.type);
}

function typeLabel(type: string): string {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Source";
}

function truncateSnippet(text: string, max = SNIPPET_MAX): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

export function hasCitationMarkers(content: string): boolean {
  return /\[\d[\d\s,]*\]/.test(content);
}

/** Parse bracketed citation markers like `[1]`, `[1, 2]`, or `[1,2]`. */
function parseCitationNumbers(inner: string): number[] {
  const nums = inner
    .split(",")
    .map((part) => part.trim())
    .filter((part) => /^\d+$/.test(part))
    .map((part) => parseInt(part, 10));
  return [...new Set(nums)];
}

function citationsForNumbers(nums: number[], citations: Citation[]): Citation[] {
  return nums
    .map((num) => citations[num - 1])
    .filter((c): c is Citation => Boolean(c));
}

export function preprocessCitationMarkers(
  content: string,
  citations: Citation[]
): string {
  return content.replace(/\[([\d\s,]+)\]/g, (match, inner: string) => {
    const nums = parseCitationNumbers(inner);
    if (nums.length === 0) return match;

    const group = citationsForNumbers(nums, citations);
    if (group.length === 0) return match;

    // Single source → one pill with just the hostname (e.g. "youtube").
    if (group.length === 1) {
      return `[${nums[0]}](citation://${group[0].source_id})`;
    }

    // Multiple sources in one marker → one grouped pill (e.g. "youtube +1").
    const ids = group.map((c) => c.source_id).join(",");
    return `[ ](citation-group://${ids})`;
  });
}

export function citationMapFrom(
  citations: Citation[] | undefined
): Map<string, Citation> {
  return new Map(citations?.map((c) => [c.source_id, c]) ?? []);
}

function CitationFavicon({
  citation,
  size = "sm",
  stacked = false,
  className,
}: {
  citation: Citation;
  size?: "sm" | "md";
  stacked?: boolean;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const Icon = typeIcon[citation.type] ?? FileText;
  const host = hostFromUrl(citation.url);
  const favicon = host
    ? `https://www.google.com/s2/favicons?sz=64&domain=${host}`
    : null;

  const box = size === "sm" ? "size-4" : "size-7";
  const img = size === "sm" ? "size-3" : "size-4";
  const icon = size === "sm" ? "size-2.5" : "size-3.5";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/80 bg-white",
        stacked && "ring-2 ring-white",
        box,
        className
      )}
    >
      {favicon && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={favicon}
          alt=""
          width={size === "sm" ? 12 : 16}
          height={size === "sm" ? 12 : 16}
          className={img}
          onError={() => setImgError(true)}
        />
      ) : (
        <Icon className={cn(icon, "text-slate-500")} />
      )}
    </span>
  );
}

function OverlappingFavicons({ citations }: { citations: Citation[] }) {
  const visible = citations.slice(0, MAX_STACKED_FAVICONS);
  return (
    <span className="flex items-center">
      {visible.map((citation, index) => (
        <CitationFavicon
          key={citation.source_id}
          citation={citation}
          size="sm"
          stacked={index > 0}
          className={cn(index > 0 && "-ml-1.5")}
        />
      ))}
    </span>
  );
}

function CitationPreviewHeader({
  citations,
  activeIndex,
  onPrevious,
  onNext,
}: {
  citations: Citation[];
  activeIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const total = citations.length;
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < total - 1;
  const multi = total > 1;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
      {multi ? (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            disabled={!canPrev}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPrevious();
            }}
            aria-label="Previous source"
            className="flex size-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="min-w-9 text-center text-xs tabular-nums text-slate-500">
            {activeIndex + 1}/{total}
          </span>
          <button
            type="button"
            disabled={!canNext}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next source"
            className="flex size-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      ) : (
        <span className="text-xs font-medium text-slate-500">Source</span>
      )}

      <div className="flex items-center gap-2">
        <OverlappingFavicons citations={citations} />
        <span className="text-xs text-slate-500">
          {total} {total === 1 ? "source" : "sources"}
        </span>
      </div>
    </div>
  );
}

function CitationPreviewBody({ citation }: { citation: Citation }) {
  const host = hostFromUrl(citation.url);
  const subtitle = host
    ? `${host} · ${typeLabel(citation.type)}`
    : typeLabel(citation.type);
  const snippet = citation.snippet?.trim();

  return (
    <div className="flex flex-col gap-2.5 px-3.5 py-3">
      <div className="flex items-center gap-2">
        <CitationFavicon citation={citation} size="md" />
        <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
      </div>

      <p className="text-sm font-semibold leading-snug tracking-tight text-foreground">
        {citation.title || "Untitled"}
      </p>

      {snippet ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {truncateSnippet(snippet)}
        </p>
      ) : null}

      {citation.url ? (
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 transition hover:text-slate-900 hover:underline"
        >
          Open
          <ExternalLink className="size-3" />
        </a>
      ) : null}
    </div>
  );
}

function CitationPreviewCard({
  citations,
  initialIndex = 0,
}: {
  citations: Citation[];
  initialIndex?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(citations.length - 1, 0))
  );
  const active = citations[activeIndex];

  if (!active) return null;

  return (
    <div className="flex flex-col">
      <CitationPreviewHeader
        citations={citations}
        activeIndex={activeIndex}
        onPrevious={() => setActiveIndex((i) => Math.max(0, i - 1))}
        onNext={() =>
          setActiveIndex((i) => Math.min(citations.length - 1, i + 1))
        }
      />
      <CitationPreviewBody citation={active} />
    </div>
  );
}

interface InlineCitationChipProps {
  citation: Citation;
  citations?: Citation[];
  initialIndex?: number;
  className?: string;
}

/** Compact inline pill with a rich hover preview. */
export function InlineCitationChip({
  citation,
  citations,
  initialIndex = 0,
  className,
}: InlineCitationChipProps) {
  const group = citations?.length ? citations : [citation];
  const label = pillLabel(group[0]);
  const extraCount = group.length - 1;
  const pillText = extraCount > 0 ? `${label} +${extraCount}` : label;

  function openSource() {
    const target = group[initialIndex] ?? citation;
    if (target.url) {
      window.open(target.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={openSource}
          className={cn(
            "mx-0.5 inline-flex translate-y-px cursor-pointer items-center gap-1 rounded-full border border-slate-200/80 bg-white px-2 py-0.5 align-middle text-xs font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50",
            className
          )}
          aria-label={`Source: ${citation.title || label}`}
        >
          <CitationFavicon citation={citation} size="sm" />
          <span className="max-w-32 truncate">{pillText}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className={cn(
          "w-80 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-0 ring-0",
          cardShadow
        )}
      >
        <CitationPreviewCard citations={group} initialIndex={initialIndex} />
      </HoverCardContent>
    </HoverCard>
  );
}

export function useCitationLookup(citations: Citation[] | undefined) {
  return useMemo(() => citationMapFrom(citations), [citations]);
}

/** Footer row: stacked favicons + source count — opens the sources drawer on click. */
export function MessageSourcesIndicator({
  citations,
  className,
}: {
  citations: Citation[];
  className?: string;
}) {
  const openSourcesDrawer = useChatStore((state) => state.openSourcesDrawer);

  if (citations.length === 0) return null;

  const label = `${citations.length} ${citations.length === 1 ? "source" : "sources"}`;

  return (
    <button
      type="button"
      onClick={() => openSourcesDrawer(citations)}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-xs text-muted-foreground transition hover:bg-slate-50 hover:text-slate-700",
        className
      )}
      aria-label={`View ${label}`}
    >
      <OverlappingFavicons citations={citations} />
      <span>{label}</span>
    </button>
  );
}
