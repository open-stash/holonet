"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@source/stores";

export function SettingsHydrate() {
  const hydrate = useSettingsStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
