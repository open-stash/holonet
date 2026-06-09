"use client";

import { useState } from "react";
import type { Source } from "@/types/kyber";
import { cn } from "@/lib/utils";
import {
  sourceSubtitle,
  sourceTitle,
  typeIcon,
  typeLabel,
} from "./source-helpers";

interface SourceListRowProps {
  source: Source;
}

export function SourceListRow({ source }: SourceListRowProps) {
  const [previewBroken, setPreviewBroken] = useState(false);
  const Icon = typeIcon[source.type];
  const title = sourceTitle(source);
  const subtitle = sourceSubtitle(source);
  // Real thumbnail: link OG image or rendered PDF first page (kyber image_url).
  const previewURL = source.image_url;
  const showPreview = !!previewURL && !previewBroken;

  return (
    <article className="flex items-center gap-4 border-b border-slate-100 px-3.5 py-2.5 transition-colors last:border-b-0 hover:bg-slate-50/80">
      <div className="size-11 shrink-0 overflow-hidden rounded-md border border-slate-200/80 bg-slate-100">
        {showPreview ? (
          <img
            src={previewURL}
            alt=""
            loading="lazy"
            className="size-full object-cover object-top"
            onError={() => setPreviewBroken(true)}
          />
        ) : (
          <div
            className={cn(
              "flex size-full items-center justify-center bg-linear-to-br",
              source.type === "link" && "from-slate-50 to-slate-100",
              source.type === "note" && "from-amber-50 to-orange-50",
              source.type === "pdf" && "from-rose-50 to-red-50",
              source.type === "ppt" && "from-violet-50 to-purple-50",
              source.type === "doc" && "from-sky-50 to-blue-50"
            )}
          >
            <Icon className="size-4 text-slate-400" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
        <Icon className="size-3" />
        {typeLabel[source.type]}
      </span>
    </article>
  );
}
