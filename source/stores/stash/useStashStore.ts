import { create } from "zustand";

interface StashStore {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useStashStore = create<StashStore>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),
}));
