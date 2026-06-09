"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Settings, Trash2 } from "lucide-react";
import { CreateCollectionDialog } from "@/components/dashboard/create-collection-dialog";
import { RenameCollectionDialog } from "@/components/dashboard/rename-collection-dialog";
import { SidebarCollectionList } from "@/components/dashboard/sidebar-collection-list";
import { BinDialog } from "@/components/dashboard/bin-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  sidebarFadeSpring,
  sidebarTextSpring,
} from "@/lib/sidebar-motion";
import {
  useCollectionsStore,
  useSidebarExpanded,
} from "@source/stores";

export function AppSidebar() {
  const pathname = usePathname();
  const isExpanded = useSidebarExpanded();
  const prefersReducedMotion = useReducedMotion();
  const [binOpen, setBinOpen] = useState(false);
  const collections = useCollectionsStore((state) => state.collections);
  const setCreateDialogOpen = useCollectionsStore(
    (state) => state.setCreateDialogOpen
  );
  const textTransition = prefersReducedMotion ? { duration: 0 } : sidebarTextSpring;
  const fadeTransition = prefersReducedMotion ? { duration: 0 } : sidebarFadeSpring;

  function isCollectionActive(collectionID: string) {
    return pathname === `/dashboard/collections/${collectionID}`;
  }

  const favouriteCollections = useMemo(
    () => collections.filter((c) => c.is_favorite),
    [collections]
  );
  const privateCollections = useMemo(
    () => collections.filter((c) => !c.is_favorite),
    [collections]
  );

  return (
    <Sidebar
      collapsible="icon"
      className="group-data-[side=left]:border-r-0 [&_[data-slot=sidebar-inner]]:overflow-hidden [&_[data-slot=sidebar-inner]]:rounded-r-xl [&_[data-slot=sidebar-inner]]:bg-[#F5F6FA] [&_[data-slot=sidebar-footer]_[data-sidebar=menu-button]:hover]:bg-transparent [&_[data-sidebar=menu-button]:hover]:text-inherit [&_[data-sidebar=menu-action]:hover]:bg-transparent [&_[data-sidebar=menu-action]:hover]:text-inherit [&_[data-sidebar=trigger]:hover]:bg-transparent [&_button.rounded-md:hover]:bg-transparent [&_button.rounded-md:hover]:text-inherit"
    >
      <CreateCollectionDialog />
      <RenameCollectionDialog />
      <BinDialog open={binOpen} onOpenChange={setBinOpen} />
      <SidebarHeader className="group-data-[collapsible=icon]:p-1">
        <div className="flex items-center gap-1 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1">
          {isExpanded ? (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <Link
                  href="/dashboard"
                  aria-label="Open Stash home"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md outline-hidden ring-sidebar-ring focus-visible:ring-2"
                >
                  <Image
                    src="/logo.svg"
                    alt=""
                    width={32}
                    height={32}
                    priority
                    className="size-8 shrink-0 rounded-lg"
                  />
                </Link>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key="brand-copy"
                    initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                    transition={textTransition}
                    className="min-w-0 overflow-x-hidden"
                  >
                    <Link
                      href="/dashboard"
                      className="block min-w-0 rounded-md outline-hidden ring-sidebar-ring focus-visible:ring-2"
                    >
                      <span className="block truncate text-sm font-semibold leading-5">
                        Open Stash
                      </span>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
              <SidebarTrigger className="ml-auto shrink-0" />
            </>
          ) : (
            <SidebarTrigger className="shrink-0" />
          )}
        </div>
      </SidebarHeader>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="header-separator"
            initial={{ opacity: 0, scaleX: 0.92 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.92 }}
            transition={fadeTransition}
          >
            <SidebarSeparator className="bg-slate-200/80" />
          </motion.div>
        )}
      </AnimatePresence>

      <SidebarContent>
        <SidebarGroup>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="recents-label"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={fadeTransition}
                className="overflow-hidden"
              >
                <SidebarGroupLabel>Recents</SidebarGroupLabel>
              </motion.div>
            )}
          </AnimatePresence>
          <SidebarGroupContent>
            <SidebarCollectionList
              label="Favourite"
              collections={favouriteCollections}
              isCollectionActive={isCollectionActive}
              isExpanded={isExpanded}
            />
            <SidebarCollectionList
              label="Private"
              collections={privateCollections}
              isCollectionActive={isCollectionActive}
              isExpanded={isExpanded}
              alwaysShowHeader
              onAdd={() => setCreateDialogOpen(true)}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setBinOpen(true)}
              tooltip="Bin"
            >
              <Trash2 />
              <motion.span
                initial={false}
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  maxWidth: isExpanded ? 120 : 0,
                }}
                transition={textTransition}
                className="truncate overflow-hidden"
              >
                Bin
              </motion.span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/settings")}
              tooltip="Settings"
            >
              <Link href="/settings/account">
                <Settings />
                <motion.span
                  initial={false}
                  animate={{
                    opacity: isExpanded ? 1 : 0,
                    maxWidth: isExpanded ? 120 : 0,
                  }}
                  transition={textTransition}
                  className="truncate overflow-hidden"
                >
                  Settings
                </motion.span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
