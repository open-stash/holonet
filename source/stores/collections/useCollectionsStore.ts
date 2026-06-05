import { create } from "zustand";
import type { Collection } from "@/types/kyber";
import {
  getCollections,
  createCollection as apiCreate,
  updateCollection as apiUpdate,
  toggleFavorite as apiToggleFavorite,
  deleteCollection as apiDelete,
} from "@/lib/api/kyber";

interface CollectionsStore {
  collections: Collection[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  createDialogOpen: boolean;
  renameTarget: { id: string; name: string } | null;

  fetchCollections: () => Promise<void>;
  setCreateDialogOpen: (open: boolean) => void;
  openRenameDialog: (id: string) => void;
  closeRenameDialog: () => void;
  addCollection: (name: string) => Promise<Collection>;
  renameCollection: (id: string, name: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  removeCollection: (id: string) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsStore>((set, get) => ({
  collections: [],
  loading: false,
  loaded: false,
  error: null,
  createDialogOpen: false,
  renameTarget: null,

  fetchCollections: async () => {
    if (get().loading) return; // prevent concurrent fetches
    set({ loading: true, error: null });
    try {
      const collections = await getCollections();
      set({ collections });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      if (msg === "session_expired") {
        localStorage.removeItem("access_token");
      }
      // Keep existing collections — don't blank the sidebar on a failed refresh
      set({ error: msg });
    } finally {
      set({ loading: false, loaded: true });
    }
  },

  setCreateDialogOpen: (createDialogOpen) => set({ createDialogOpen }),

  openRenameDialog: (id) => {
    const collection = get().collections.find((c) => c.id === id);
    if (!collection) return;
    set({ renameTarget: { id, name: collection.name } });
  },

  closeRenameDialog: () => set({ renameTarget: null }),

  addCollection: async (name) => {
    const collection = await apiCreate(name);
    set((state) => ({
      collections: [...state.collections, collection],
      createDialogOpen: false,
    }));
    return collection;
  },

  renameCollection: async (id, name) => {
    const updated = await apiUpdate(id, name);
    set((state) => ({
      collections: state.collections.map((c) => (c.id === id ? updated : c)),
      renameTarget: null,
    }));
  },

  toggleFavorite: async (id) => {
    const current = get().collections.find((c) => c.id === id);
    if (!current) return;

    // Optimistic update — sidebar moves instantly without waiting for API
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, is_favorite: !c.is_favorite } : c
      ),
    }));

    try {
      await apiToggleFavorite(id, !current.is_favorite);
    } catch (err) {
      // Revert on failure
      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === id ? { ...c, is_favorite: current.is_favorite } : c
        ),
      }));
      throw err;
    }
  },

  removeCollection: async (id) => {
    await apiDelete(id);
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    }));
  },
}));
