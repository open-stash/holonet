import { create } from "zustand";
import {
  mockSources,
  type MockSource,
  type SourceType,
} from "@/components/dashboard/mock";
import {
  getSourcesByCollection,
  deleteSource as apiDeleteSource,
  moveSource as apiMoveSource,
} from "@/lib/api/kyber";
import { useCollectionsStore } from "../collections/useCollectionsStore";

export type SourceTypeFilter = "all" | SourceType;

// Refresh collections so sidebar item_count reflects source add/remove/move.
function refreshCollectionCounts() {
  void useCollectionsStore.getState().fetchCollections();
}

// Last server-paginated query, so deletes/moves can re-fetch the same page.
let lastQuery = { collectionId: "", limit: 12, offset: 0 };

interface SourcesStore {
  items: MockSource[];
  total: number;
  loading: boolean;
  page: number;
  limit: number;
  typeFilter: SourceTypeFilter;
  moveTargetId: string | null;
  fetchSources: () => Promise<void>;
  fetchByCollection: (collectionId: string, limit: number, offset: number) => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTypeFilter: (filter: SourceTypeFilter) => void;
  openMoveDialog: (sourceId: string) => void;
  closeMoveDialog: () => void;
  moveSourceToCollection: (sourceId: string, collectionId: string) => Promise<void>;
  removeSource: (sourceId: string) => Promise<void>;
  getFilteredSources: () => MockSource[];
  getPaginatedSources: () => MockSource[];
  getTotal: () => number;
  getTotalPages: () => number;
}

export const useSourcesStore = create<SourcesStore>((set, get) => ({
  items: mockSources,
  total: 0,
  loading: false,
  page: 1,
  limit: 12,
  typeFilter: "all",
  moveTargetId: null,

  fetchSources: async () => {
    // API seam: replace this mock hydration with kyber fetch later.
    set({ loading: true });
    await Promise.resolve();
    set({ items: mockSources, loading: false });
  },

  fetchByCollection: async (collectionId, limit, offset) => {
    lastQuery = { collectionId, limit, offset };
    set({ loading: true });
    try {
      const { items, total } = await getSourcesByCollection(collectionId, limit, offset);
      // kyber's Source is structurally assignable to MockSource (preview_image_url optional)
      set({ items, total });
    } catch {
      set({ items: [], total: 0 });
    } finally {
      set({ loading: false });
    }
  },

  refreshCurrentPage: async () => {
    if (!lastQuery.collectionId) return;
    await get().fetchByCollection(
      lastQuery.collectionId,
      lastQuery.limit,
      lastQuery.offset
    );
  },

  setPage: (page) => {
    const nextPage = Math.max(1, page);
    const totalPages = get().getTotalPages();
    set({ page: Math.min(nextPage, totalPages || 1) });
  },

  setLimit: (limit) => {
    set({ limit, page: 1 });
  },

  setTypeFilter: (typeFilter) => {
    set({ typeFilter, page: 1 });
  },

  openMoveDialog: (sourceId) => set({ moveTargetId: sourceId }),
  closeMoveDialog: () => set({ moveTargetId: null }),

  moveSourceToCollection: async (sourceId, collectionId) => {
    const prev = get().items;
    const source = prev.find((item) => item.id === sourceId);
    if (!source || source.collection_id === collectionId) {
      set({ moveTargetId: null });
      return;
    }
    // Optimistic: moving out of the currently-viewed collection removes it from the list
    set({
      items: prev.filter((item) => item.id !== sourceId),
      moveTargetId: null,
    });
    try {
      await apiMoveSource(sourceId, collectionId);
      refreshCollectionCounts();
      await get().refreshCurrentPage(); // backfill page + update total
    } catch (err) {
      set({ items: prev }); // revert
      throw err;
    }
  },

  removeSource: async (sourceId) => {
    const prev = get().items;
    const source = prev.find((item) => item.id === sourceId);
    set({ items: prev.filter((item) => item.id !== sourceId) }); // optimistic
    try {
      await apiDeleteSource(sourceId, source?.type ?? "");
      refreshCollectionCounts();
      await get().refreshCurrentPage(); // backfill page + update total
    } catch (err) {
      set({ items: prev }); // revert
      throw err;
    }
  },

  getFilteredSources: () => {
    const { items, typeFilter } = get();

    return items
      .filter((source) => typeFilter === "all" || source.type === typeFilter)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  getPaginatedSources: () => {
    const { page, limit, getFilteredSources } = get();
    const filtered = getFilteredSources();
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  },

  getTotal: () => get().getFilteredSources().length,

  getTotalPages: () => {
    const { limit, getTotal } = get();
    return Math.max(1, Math.ceil(getTotal() / limit));
  },
}));
