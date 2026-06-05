"use client";

import type { CollectionViewMode } from "./use-collection-view-mode";
import { SourcesViewModeToggle } from "./sources-view-mode-toggle";

interface SourcesToolbarProps {
  title?: string;
  subtitle?: string;
  total: number;
  viewMode?: CollectionViewMode;
  onViewModeChange?: (value: CollectionViewMode) => void;
}

export function SourcesToolbar({
  title = "All items",
  subtitle,
  total,
  viewMode,
  onViewModeChange,
}: SourcesToolbarProps) {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {subtitle ?? `${total} source${total === 1 ? "" : "s"} in your stash.`}
        </p>
      </div>

      {viewMode && onViewModeChange ? (
        <div className="flex justify-end self-end sm:self-auto">
          <SourcesViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      ) : null}
    </section>
  );
}
