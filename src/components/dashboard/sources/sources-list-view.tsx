"use client";

import type { Source } from "@/types/kyber";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceListRow } from "./source-list-row";
import { SourcesEmpty } from "./sources-empty";

interface SourcesListViewProps {
  loading: boolean;
  sources: Source[];
}

export function SourcesListView({ loading, sources }: SourcesListViewProps) {
  if (loading) {
    return (
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`list-skeleton-${index}`}
            className="flex items-center gap-4 border-b border-slate-100 px-3.5 py-2.5 last:border-b-0"
          >
            <Skeleton className="size-11 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
        ))}
      </section>
    );
  }

  if (!sources.length) return <SourcesEmpty />;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      {sources.map((source) => (
        <SourceListRow key={source.id} source={source} />
      ))}
    </section>
  );
}
