import { create } from "zustand";

/** Matches shadcn SidebarProvider cookie so state survives reloads. */
export const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function readSidebarCookie(): boolean {
  if (typeof document === "undefined") return true;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SIDEBAR_COOKIE_NAME}=([^;]*)`)
  );
  if (!match) return true;
  return match[1] === "true";
}

interface SidebarStore {
  /** Desktop sidebar expanded (true) vs icon rail (false). */
  open: boolean;
  /** Mobile sheet open state. */
  openMobile: boolean;
  /** True after client cookie has been read (avoids hydration mismatch). */
  hydrated: boolean;
  setOpen: (open: boolean) => void;
  setOpenMobile: (openMobile: boolean) => void;
  toggle: () => void;
  toggleMobile: () => void;
  hydrate: () => void;
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  open: true,
  openMobile: false,
  hydrated: false,

  hydrate: () => {
    set({ open: readSidebarCookie(), hydrated: true });
  },

  setOpen: (open) => {
    if (typeof document !== "undefined") {
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }
    set({ open });
  },

  setOpenMobile: (openMobile) => set({ openMobile }),

  toggle: () => {
    const next = !get().open;
    get().setOpen(next);
  },

  toggleMobile: () => set((state) => ({ openMobile: !state.openMobile })),
}));

/** Desktop sidebar is expanded (not collapsed to icons). */
export function useSidebarExpanded() {
  return useSidebarStore((state) => state.open);
}
