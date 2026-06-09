"use client";

import type { Source } from "@/types/kyber";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceCard } from "./source-card";
import { SourcesEmpty } from "./sources-empty";

const masonryClass =
  "columns-2 gap-3 md:columns-3 xl:columns-4 2xl:columns-5 [&>*]:mb-3 [&>*]:break-inside-avoid";

interface SourcesGridProps {
  loading: boolean;
  sources: Source[];
}

export function SourcesGrid({ loading, sources }: SourcesGridProps) {
  if (loading) {
    return (
      <section className={masonryClass}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`source-skeleton-${index}`}
            className="overflow-hidden rounded-xl border border-[#e7e7e9] bg-white"
          >
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-2 p-3.5">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (!sources.length) return <SourcesEmpty />;

  return (
    <section className={masonryClass}>
      {sources.map((source) => (
        <SourceCard key={source.id} source={source} />
      ))}
    </section>
  );
}
