import { create } from "zustand";
import {
  defaultUserSettings,
  type CollectionViewMode,
  type StashMode,
  type UserSettings,
} from "./settings-types";

const STORAGE_KEY = "openstash:settings";
const LEGACY_VIEW_KEY = "openstash:collection-view-mode";

const VALID_VIEW_MODES: CollectionViewMode[] = ["cards", "grouped", "list"];
const VALID_STASH_MODES: StashMode[] = ["note", "link", "upload"];

function parseSettings(): UserSettings {
  if (typeof window === "undefined") return defaultUserSettings;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserSettings>;
      return {
        ...defaultUserSettings,
        ...parsed,
        collectionViewMode: VALID_VIEW_MODES.includes(
          parsed.collectionViewMode as CollectionViewMode
        )
          ? (parsed.collectionViewMode as CollectionViewMode)
          : defaultUserSettings.collectionViewMode,
        defaultStashMode: VALID_STASH_MODES.includes(
          parsed.defaultStashMode as StashMode
        )
          ? (parsed.defaultStashMode as StashMode)
          : defaultUserSettings.defaultStashMode,
      };
    }
  } catch {
    /* use defaults */
  }

  const legacyView = localStorage.getItem(LEGACY_VIEW_KEY);
  if (legacyView && VALID_VIEW_MODES.includes(legacyView as CollectionViewMode)) {
    return {
      ...defaultUserSettings,
      collectionViewMode: legacyView as CollectionViewMode,
    };
  }

  return defaultUserSettings;
}

function persistSettings(settings: UserSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  localStorage.setItem(LEGACY_VIEW_KEY, settings.collectionViewMode);
}

function pickSettings(state: SettingsStore): UserSettings {
  return {
    displayName: state.displayName,
    email: state.email,
    organization: state.organization,
    collectionViewMode: state.collectionViewMode,
    defaultStashMode: state.defaultStashMode,
    confirmBeforeDelete: state.confirmBeforeDelete,
    emailDigest: state.emailDigest,
    stashToasts: state.stashToasts,
  };
}

interface SettingsStore extends UserSettings {
  hydrated: boolean;
  hydrate: () => void;
  setDisplayName: (displayName: string) => void;
  setEmail: (email: string) => void;
  setOrganization: (organization: string) => void;
  setCollectionViewMode: (mode: CollectionViewMode) => void;
  setDefaultStashMode: (mode: StashMode) => void;
  setConfirmBeforeDelete: (value: boolean) => void;
  setEmailDigest: (value: boolean) => void;
  setStashToasts: (value: boolean) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultUserSettings,
  hydrated: false,

  hydrate: () => {
    set({ ...parseSettings(), hydrated: true });
  },

  setDisplayName: (displayName) => {
    set({ displayName });
    persistSettings(pickSettings({ ...get(), displayName }));
  },

  setEmail: (email) => {
    set({ email });
    persistSettings(pickSettings({ ...get(), email }));
  },

  setOrganization: (organization) => {
    set({ organization });
    persistSettings(pickSettings({ ...get(), organization }));
  },

  setCollectionViewMode: (collectionViewMode) => {
    set({ collectionViewMode });
    persistSettings(pickSettings({ ...get(), collectionViewMode }));
  },

  setDefaultStashMode: (defaultStashMode) => {
    set({ defaultStashMode });
    persistSettings(pickSettings({ ...get(), defaultStashMode }));
  },

  setConfirmBeforeDelete: (confirmBeforeDelete) => {
    set({ confirmBeforeDelete });
    persistSettings(pickSettings({ ...get(), confirmBeforeDelete }));
  },

  setEmailDigest: (emailDigest) => {
    set({ emailDigest });
    persistSettings(pickSettings({ ...get(), emailDigest }));
  },

  setStashToasts: (stashToasts) => {
    set({ stashToasts });
    persistSettings(pickSettings({ ...get(), stashToasts }));
  },

  resetSettings: () => {
    set({ ...defaultUserSettings });
    persistSettings(defaultUserSettings);
  },
}));
