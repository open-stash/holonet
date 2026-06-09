"use client";

import { useState, type ReactNode } from "react";
import { FileText, ImageIcon, Link2 } from "lucide-react";
import type { Source } from "@/types/kyber";
import { cn } from "@/lib/utils";
import {
  estimatedPageCount,
  estimatedSlideCount,
  faviconUrl,
  sourceDomain,
  sourceTitle,
  typeIcon,
  typeLabel,
} from "./source-helpers";
import { SourceCardMenu } from "./source-card-menu";
import { SourceTypeTag } from "./source-type-tag";

interface SourceCardProps {
  source: Source;
}

// Shared shell for white (link / pdf / doc / slide) cards — soft border, depth,
// and a subtle hover lift for tactility.
const whiteCardClass =
  "overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-[0_6px_20px_-6px_rgba(15,23,42,0.12)]";

function SourceCardShell({
  source,
  className,
  children,
}: {
  source: Source;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={cn("group relative", className)}>
      <SourceCardMenu source={source} />
      {children}
    </article>
  );
}

// True while the async worker is still scraping/embedding the source — the
// thumbnail isn't available yet, so we show a "fetching preview" affordance.
function isProcessing(source: Source) {
  return source.status === "pending" || source.status === "processing";
}

// Animated skeleton shown in the preview area while the thumbnail is being scraped.
// A neutral block with a shimmer sweep + faint image glyph — replaces the real
// preview until the worker populates image_url.
function PreviewSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "shimmer flex w-full items-center justify-center bg-slate-100",
        className
      )}
    >
      <ImageIcon className="size-6 text-slate-300" />
    </div>
  );
}

function CardFoot({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-3">
      <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-[-0.01em] text-slate-800">
        {title}
      </h3>
      {children}
    </div>
  );
}

function LinkCard({ source }: SourceCardProps) {
  const [previewBroken, setPreviewBroken] = useState(false);
  const Icon = typeIcon.link;
  const title = sourceTitle(source);
  const domain = sourceDomain(source);
  const previewURL = source.image_url;
  const showPreview = !!previewURL && !previewBroken;
  const processing = isProcessing(source) && !showPreview;

  return (
    <SourceCardShell source={source} className={whiteCardClass}>
      <div className="relative overflow-hidden border-b border-slate-100 bg-slate-50">
        {showPreview ? (
          <img
            src={previewURL}
            alt=""
            loading="lazy"
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setPreviewBroken(true)}
          />
        ) : processing ? (
          <PreviewSkeleton className="aspect-video" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300">
            <Link2 className="size-6" />
          </div>
        )}
        <SourceTypeTag icon={Icon} label={typeLabel.link} />
      </div>
      <CardFoot title={title}>
        {domain ? (
          <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500">
            <img
              src={faviconUrl(domain)}
              alt=""
              className="size-3.5 shrink-0 rounded-[3px]"
              loading="lazy"
            />
            <span className="truncate">{domain}</span>
          </span>
        ) : null}
      </CardFoot>
    </SourceCardShell>
  );
}

function NoteCard({ source }: SourceCardProps) {
  const Icon = typeIcon.note;
  const title = sourceTitle(source);

  return (
    <SourceCardShell
      source={source}
      className="overflow-hidden rounded-xl border border-amber-100 bg-[#fdfaf3] p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-6px_rgba(180,140,40,0.16)]"
    >
      <div className="mb-2.5">
        <SourceTypeTag icon={Icon} label={typeLabel.note} floating={false} />
      </div>
      <h3 className="line-clamp-4 text-[14px] font-semibold leading-relaxed tracking-[-0.01em] text-[#4a3f24]">
        {title}
      </h3>
    </SourceCardShell>
  );
}

function DocumentPagePreview({
  title,
  bandClassName,
  kicker,
  chartClassName,
}: {
  title: string;
  bandClassName: string;
  kicker: string;
  chartClassName: string;
}) {
  const lineWidths = ["100%", "85%", "92%", "70%", "88%"];
  const barHeights = ["45%", "70%", "55%", "85%", "50%", "75%"];

  return (
    <div className="relative aspect-[4/3] overflow-hidden border-b border-[#eef0f2] bg-linear-to-br from-[#f3f4f6] to-[#e9eaee] px-5 pt-[18px]">
      <div className="flex h-full w-full items-end justify-center">
        <div className="h-full w-full overflow-hidden rounded-t-md bg-white">
          <div className={bandClassName} />
          <div className="p-4">
            <p
              className={`mb-1.5 text-[8px] font-semibold tracking-[0.14em] uppercase ${
                kicker === "DOC" ? "text-sky-500" : "text-rose-500"
              }`}
            >
              {kicker}
            </p>
            <h4 className="mb-2.5 line-clamp-2 text-[15px] leading-tight font-bold text-gray-800">
              {title}
            </h4>
            <div className="flex flex-col gap-1">
              {lineWidths.map((width) => (
                <span
                  key={width}
                  className="block h-1 rounded-sm bg-[#e3e5e9]"
                  style={{ width }}
                />
              ))}
            </div>
            <div className="mt-3 flex h-[42px] items-end gap-1.5">
              {barHeights.map((height) => (
                <span
                  key={height}
                  className={`flex-1 rounded-t-sm ${chartClassName}`}
                  style={{ height }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PdfCard({ source }: SourceCardProps) {
  const [thumbBroken, setThumbBroken] = useState(false);
  const Icon = typeIcon.pdf;
  const title = sourceTitle(source);
  const pages = estimatedPageCount(source);
  const showThumb = !!source.image_url && !thumbBroken;
  const processing = isProcessing(source) && !showThumb;

  return (
    <SourceCardShell
      source={source}
      className={whiteCardClass}
    >
      <div className="relative">
        {showThumb ? (
          <div className="overflow-hidden border-b border-[#eef0f2] bg-[#f4f4f5]">
            <img
              src={source.image_url}
              alt=""
              loading="lazy"
              className="aspect-[4/3] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
              onError={() => setThumbBroken(true)}
            />
          </div>
        ) : processing ? (
          <PreviewSkeleton className="aspect-[4/3]" />
        ) : (
          <DocumentPagePreview
            title={title}
            bandClassName="h-[9px] w-full bg-rose-500"
            kicker="PDF"
            chartClassName="bg-rose-200"
          />
        )}
        <SourceTypeTag icon={Icon} label={typeLabel.pdf} />
      </div>
      <CardFoot title={title}>
        <p className="flex items-center gap-1 text-[11px] text-slate-500">
          <FileText className="size-3" />
          {pages} pages
        </p>
      </CardFoot>
    </SourceCardShell>
  );
}

function DocCard({ source }: SourceCardProps) {
  const Icon = typeIcon.doc;
  const title = sourceTitle(source);
  const pages = estimatedPageCount(source);

  return (
    <SourceCardShell
      source={source}
      className={whiteCardClass}
    >
      <div className="relative">
        <DocumentPagePreview
          title={title}
          bandClassName="h-[9px] w-full bg-sky-500"
          kicker="DOC"
          chartClassName="bg-sky-200"
        />
        <SourceTypeTag icon={Icon} label={typeLabel.doc} />
      </div>
      <CardFoot title={title}>
        <p className="flex items-center gap-1 text-[11px] text-slate-500">
          <FileText className="size-3" />
          {pages} pages
        </p>
      </CardFoot>
    </SourceCardShell>
  );
}

function SlideCard({ source }: SourceCardProps) {
  const Icon = typeIcon.ppt;
  const title = sourceTitle(source);
  const slides = estimatedSlideCount(source);

  return (
    <SourceCardShell
      source={source}
      className={whiteCardClass}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-[#eef0f2] bg-linear-to-br from-[#f3f4f6] to-[#e9eaee] p-5">
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-linear-to-br from-violet-600 to-purple-900">
          <div className="flex h-full flex-col justify-center p-5">
            <div className="mb-3.5 h-1.5 w-[26px] rounded-full bg-white/85" />
            <h4 className="line-clamp-2 text-[17px] leading-tight font-bold tracking-tight text-white">
              {title}
            </h4>
            <div className="mt-3 h-1 w-[62%] rounded-full bg-white/50" />
            <div className="mt-1.5 h-1 w-[40%] rounded-full bg-white/30" />
          </div>
        </div>
        <SourceTypeTag icon={Icon} label={typeLabel.ppt} />
      </div>
      <CardFoot title={title}>
        <p className="text-[11px] text-slate-500">{slides} slides</p>
      </CardFoot>
    </SourceCardShell>
  );
}

export function SourceCard({ source }: SourceCardProps) {
  switch (source.type) {
    case "link":
      return <LinkCard source={source} />;
    case "note":
      return <NoteCard source={source} />;
    case "pdf":
      return <PdfCard source={source} />;
    case "ppt":
      return <SlideCard source={source} />;
    case "doc":
      return <DocCard source={source} />;
    default:
      return <LinkCard source={source} />;
  }
}
