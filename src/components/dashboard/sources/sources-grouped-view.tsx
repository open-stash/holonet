"use client";

import type { Source } from "@/types/kyber";
import { groupSourcesByType, typeLabel } from "./source-helpers";
import { SourceCard } from "./source-card";
import { SourcesEmpty } from "./sources-empty";

interface SourcesGroupedViewProps {
  sources: Source[];
}

export function SourcesGroupedView({ sources }: SourcesGroupedViewProps) {
  if (!sources.length) return <SourcesEmpty />;

  const groups = groupSourcesByType(sources);

  return (
    <section className="flex flex-col gap-8">
      {groups.map(({ type, items }) => (
        <div key={type}>
          <header className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
            <h2 className="text-[15px] font-semibold tracking-tight">
              {typeLabel[type]}
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
              {items.length}
            </span>
          </header>
          <div className="columns-2 gap-3 md:columns-3 xl:columns-4 2xl:columns-5 [&>*]:mb-3 [&>*]:break-inside-avoid">
            {items.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
