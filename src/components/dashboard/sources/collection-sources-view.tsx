"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";
import { useCollectionsStore, useSourcesStore } from "@source/stores";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MockSource } from "@/components/dashboard/mock";
import { SourcesGrid } from "./sources-grid";
import { SourcesGroupedView } from "./sources-grouped-view";
import { SourcesListView } from "./sources-list-view";
import { SourcesPagination } from "./sources-pagination";
import { SourcesToolbar } from "./sources-toolbar";
import { useCollectionViewMode } from "./use-collection-view-mode";
import { useSourceProcessingPoll } from "./use-source-processing-poll";

interface CollectionSourcesViewProps {
  collectionID: string;
}

function CollectionSourcesContent({
  loading,
  viewMode,
  sources,
}: {
  loading: boolean;
  viewMode: ReturnType<typeof useCollectionViewMode>["viewMode"];
  sources: MockSource[];
}) {
  if (loading) {
    if (viewMode === "list") {
      return <SourcesListView loading sources={[]} />;
    }

    return <SourcesGrid loading sources={[]} />;
  }

  if (viewMode === "grouped") {
    return <SourcesGroupedView sources={sources} />;
  }

  if (viewMode === "list") {
    return <SourcesListView loading={false} sources={sources} />;
  }

  return <SourcesGrid loading={false} sources={sources} />;
}

export function CollectionSourcesView({ collectionID }: CollectionSourcesViewProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const { viewMode, setViewMode, hydrated } = useCollectionViewMode();

  const collections = useCollectionsStore((state) => state.collections);
  const collectionsLoaded = useCollectionsStore((state) => state.loaded);
  const items = useSourcesStore((state) => state.items);
  const total = useSourcesStore((state) => state.total);
  const loading = useSourcesStore((state) => state.loading);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const clampedPage = Math.min(page, totalPages);

  // Server-side pagination: fetch the current page when collection/page/limit changes.
  useEffect(() => {
    useSourcesStore
      .getState()
      .fetchByCollection(collectionID, limit, (clampedPage - 1) * limit);
  }, [collectionID, clampedPage, limit]);

  // Reset to page 1 when switching collections (local page state would otherwise persist).
  useEffect(() => {
    setPage(1);
  }, [collectionID]);

  // Keep newly-saved sources updating in place (thumbnail/status) without a refresh.
  useSourceProcessingPoll(collectionID);

  // Ensure collections are loaded (e.g. on a hard refresh of this page directly).
  useEffect(() => {
    if (!useCollectionsStore.getState().loaded) {
      void useCollectionsStore.getState().fetchCollections();
    }
  }, []);

  const collection = useMemo(
    () => collections.find((item) => item.id === collectionID),
    [collectionID, collections]
  );

  // items is already the current page, server-sorted (created_at desc).
  const paginatedSources = items;

  function handleLimitChange(nextLimit: number) {
    setLimit(nextLimit);
    setPage(1);
  }

  // Collections still loading (e.g. hard refresh) — don't flash "not found" yet.
  if (!collection && !collectionsLoaded) {
    return (
      <main className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`collection-load-skeleton-${index}`}
              className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
            >
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-3.5">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </section>
      </main>
    );
  }

  // Loaded, but this collection genuinely doesn't exist (or was removed).
  if (!collection) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <FolderOpen className="size-6 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Collection not found</h1>
          <p className="text-sm text-muted-foreground">
            This collection may have been removed.
          </p>
          <Button asChild size="sm">
            <Link href="/dashboard">Go home</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <SourcesToolbar
        title={collection.name}
        subtitle={`${total} source${total === 1 ? "" : "s"} in this collection.`}
        total={total}
        viewMode={hydrated ? viewMode : "cards"}
        onViewModeChange={setViewMode}
      />

      {!hydrated ? (
        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`hydrate-skeleton-${index}`}
              className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
            >
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-3.5">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </section>
      ) : (
        <CollectionSourcesContent
          loading={loading}
          viewMode={viewMode}
          sources={paginatedSources}
        />
      )}

      <div className="mt-auto">
        <SourcesPagination
          page={clampedPage}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onLimitChange={handleLimitChange}
          onPageChange={setPage}
        />
      </div>
    </main>
  );
}
