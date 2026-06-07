"use client";

import { useEffect } from "react";
import { useSourcesStore } from "@source/stores";

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_MS = 90_000; // safety cap: stop polling a never-finishing job

// useSourceProcessingPoll polls the current collection page (silently) while any
// visible source is still being processed (status "pending"/"processing"), so the
// server-populated thumbnail + status fill in without a manual refresh.
//
// It stops when nothing is pending anymore, when the collection changes/unmounts,
// when the tab is hidden (resuming on focus), and after MAX_POLL_MS as a backstop.
export function useSourceProcessingPoll(collectionID: string) {
  const hasPending = useSourcesStore((state) =>
    state.items.some((s) => s.status === "pending" || s.status === "processing")
  );

  useEffect(() => {
    if (!hasPending) return;

    const startedAt = Date.now();
    let timer: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const tick = () => {
      if (Date.now() - startedAt > MAX_POLL_MS) {
        stop();
        return;
      }
      if (typeof document !== "undefined" && document.hidden) return; // skip while hidden
      void useSourcesStore.getState().refreshCurrentPage(true);
    };

    const start = () => {
      if (!timer) timer = setInterval(tick, POLL_INTERVAL_MS);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hasPending, collectionID]);
}
