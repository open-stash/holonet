"use client";

import { useEffect } from "react";
import { useSettingsStore, type CollectionViewMode } from "@source/stores";

export type { CollectionViewMode };

export function useCollectionViewMode() {
  const hydrated = useSettingsStore((state) => state.hydrated);
  const viewMode = useSettingsStore((state) => state.collectionViewMode);
  const setCollectionViewMode = useSettingsStore(
    (state) => state.setCollectionViewMode
  );
  const hydrate = useSettingsStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return {
    viewMode,
    setViewMode: setCollectionViewMode,
    hydrated,
  };
}
