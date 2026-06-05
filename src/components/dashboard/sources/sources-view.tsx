"use client";

import { useEffect, useMemo } from "react";
import { useSourcesStore } from "@source/stores";
import { SourcesGrid } from "./sources-grid";
import { SourcesPagination } from "./sources-pagination";
import { SourcesToolbar } from "./sources-toolbar";

export function SourcesView() {
  const loading = useSourcesStore((state) => state.loading);
  const page = useSourcesStore((state) => state.page);
  const limit = useSourcesStore((state) => state.limit);
  const items = useSourcesStore((state) => state.items);
  const fetchSources = useSourcesStore((state) => state.fetchSources);
  const setPage = useSourcesStore((state) => state.setPage);
  const setLimit = useSourcesStore((state) => state.setLimit);

  const sortedSources = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [items]
  );

  const total = sortedSources.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const paginatedSources = useMemo(() => {
    const start = (page - 1) * limit;
    return sortedSources.slice(start, start + limit);
  }, [sortedSources, limit, page]);

  useEffect(() => {
    void fetchSources();
  }, [fetchSources]);

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <SourcesToolbar total={total} />

      <SourcesGrid loading={loading} sources={paginatedSources} />

      <SourcesPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onLimitChange={setLimit}
        onPageChange={setPage}
      />
    </main>
  );
}
