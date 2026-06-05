"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardTopNavbar } from "@/components/dashboard/dashboard-top-navbar";
import { CreateStashDialog } from "@/components/dashboard/create-stash-dialog";
import { MoveSourceDialog } from "@/components/dashboard/sources/move-source-dialog";
import { SearchCommandDialog } from "@/components/dashboard/search-command-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useCollectionsStore, useSettingsStore, useSidebarStore } from "@source/stores";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const open = useSidebarStore((state) => state.open);
  const setOpen = useSidebarStore((state) => state.setOpen);
  const hydrated = useSidebarStore((state) => state.hydrated);
  const initDone = useRef(false);

  useLayoutEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    useSidebarStore.getState().hydrate();
    useSettingsStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    useCollectionsStore.getState().fetchCollections();
  }, [hydrated]);

  return (
    <SidebarProvider
      open={hydrated ? open : true}
      onOpenChange={setOpen}
    >
      <SearchCommandDialog />
      <CreateStashDialog />
      <MoveSourceDialog />
      <AppSidebar />
      <SidebarInset className="min-h-0">
        <DashboardTopNavbar />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
