import { create } from "zustand";
import type { Source } from "@/types/kyber";
import {
  getSourcesByCollection,
  deleteSource as apiDeleteSource,
  moveSource as apiMoveSource,
} from "@/lib/api/kyber";
import { useCollectionsStore } from "../collections/useCollectionsStore";

// Refresh collections so sidebar item_count reflects source add/remove/move.
function refreshCollectionCounts() {
  void useCollectionsStore.getState().fetchCollections();
}

// Last server-paginated query, so deletes/moves can re-fetch the same page.
let lastQuery = { collectionId: "", limit: 12, offset: 0 };

// Sources deleted client-side but possibly not yet purged server-side. Kyber's
// DELETE is async (it queues the row/S3/vector cleanup to coruscant and returns
// immediately), so a refetch can still return the row for a beat. We filter these
// ids out of every fetch so a deleted card never flickers back, then drop the id
// once the worker has surely finished.
const deletingIds = new Set<string>();
const DELETE_PURGE_MS = 30_000;

interface SourcesStore {
  items: Source[];
  total: number;
  loading: boolean;
  moveTargetId: string | null;
  fetchByCollection: (
    collectionId: string,
    limit: number,
    offset: number,
    silent?: boolean
  ) => Promise<void>;
  refreshCurrentPage: (silent?: boolean) => Promise<void>;
  addSourceOptimistic: (source: Source) => void;
  openMoveDialog: (sourceId: string) => void;
  closeMoveDialog: () => void;
  moveSourceToCollection: (sourceId: string, collectionId: string) => Promise<void>;
  removeSource: (sourceId: string) => Promise<void>;
}

export const useSourcesStore = create<SourcesStore>((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  moveTargetId: null,

  fetchByCollection: async (collectionId, limit, offset, silent = false) => {
    lastQuery = { collectionId, limit, offset };
    // Silent fetches (background polling) skip the loading flag so the grid
    // doesn't flash skeletons every poll tick.
    if (!silent) set({ loading: true });
    try {
      const { items, total } = await getSourcesByCollection(collectionId, limit, offset);
      // Drop any rows still mid-deletion so they don't reappear; correct the count
      // for the ones we hid on this page.
      const visible =
        deletingIds.size === 0
          ? items
          : items.filter((s) => !deletingIds.has(s.id));
      const hiddenOnPage = items.length - visible.length;
      set({ items: visible, total: Math.max(0, total - hiddenOnPage) });
    } catch {
      // On a silent poll failure, keep what's on screen rather than wiping it.
      if (!silent) set({ items: [], total: 0 });
    } finally {
      if (!silent) set({ loading: false });
    }
  },

  // addSourceOptimistic prepends a just-saved source so its card shows up
  // instantly (status usually "pending"), without waiting for a refetch. Only
  // applies when it belongs to the currently-viewed collection; the background
  // poll then reconciles real fields (thumbnail, status) from the server.
  addSourceOptimistic: (source) => {
    if (source.collection_id !== lastQuery.collectionId) return;
    const prev = get().items;
    if (prev.some((s) => s.id === source.id)) return;
    set({ items: [source, ...prev], total: get().total + 1 });
  },

  refreshCurrentPage: async (silent = false) => {
    if (!lastQuery.collectionId) return;
    await get().fetchByCollection(
      lastQuery.collectionId,
      lastQuery.limit,
      lastQuery.offset,
      silent
    );
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
    const prevTotal = get().total;
    const source = prev.find((item) => item.id === sourceId);

    // Optimistic: drop the card now and guard the id so any in-flight/poll refetch
    // (which may still see the row — delete is async) can't bring it back.
    deletingIds.add(sourceId);
    set({
      items: prev.filter((item) => item.id !== sourceId),
      total: Math.max(0, prevTotal - 1),
    });

    try {
      await apiDeleteSource(sourceId, source?.type ?? "");
      refreshCollectionCounts();
      // Silent refetch backfills the page (e.g. pulls the next item up); the
      // deletingIds filter keeps the removed row from reappearing meanwhile.
      await get().refreshCurrentPage(true);
      // Stop guarding once coruscant has surely purged it, so the server count
      // becomes the source of truth again.
      setTimeout(() => deletingIds.delete(sourceId), DELETE_PURGE_MS);
    } catch (err) {
      deletingIds.delete(sourceId);
      set({ items: prev, total: prevTotal }); // revert
      throw err;
    }
  },
}));
