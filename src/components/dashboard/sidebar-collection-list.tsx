"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FolderOpen, Plus } from "lucide-react";
import type { Collection } from "@/types/kyber";
import { CollectionRowMenu } from "@/components/dashboard/collection-row-menu";
import { cn } from "@/lib/utils";
import { sidebarFadeSpring, sidebarTextSpring } from "@/lib/sidebar-motion";
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarCollectionListProps {
  label: string;
  collections: Collection[];
  isCollectionActive: (collectionID: string) => boolean;
  isExpanded: boolean;
  alwaysShowHeader?: boolean;
  onAdd?: () => void;
}

export function SidebarCollectionList({
  label,
  collections,
  isCollectionActive,
  isExpanded,
  alwaysShowHeader = false,
  onAdd,
}: SidebarCollectionListProps) {
  const { state, isMobile } = useSidebar();
  const prefersReducedMotion = useReducedMotion();
  const textTransition = prefersReducedMotion ? { duration: 0 } : sidebarTextSpring;
  const fadeTransition = prefersReducedMotion ? { duration: 0 } : sidebarFadeSpring;

  if (!alwaysShowHeader && collections.length === 0) return null;

  return (
    <div className="mb-2 last:mb-0">
      {onAdd ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onAdd}
              className={cn(
                "mb-1.5 flex w-full items-center justify-between gap-1 rounded-md px-2 py-1.5 text-left",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isExpanded ? "justify-between" : "justify-center px-1"
              )}
            >
              <motion.span
                initial={false}
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  maxWidth: isExpanded ? 160 : 0,
                }}
                transition={textTransition}
                className="overflow-hidden text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                {label}
              </motion.span>
              <motion.div
                initial={false}
                animate={{ scale: isExpanded ? 1 : 1.05 }}
                transition={textTransition}
              >
                <Plus className="size-4 shrink-0 opacity-70" />
              </motion.div>
              <span className="sr-only">New collection</span>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            hidden={state !== "collapsed" || isMobile}
          >
            New collection
          </TooltipContent>
        </Tooltip>
      ) : (
        <motion.p
          initial={false}
          animate={{
            opacity: isExpanded ? 1 : 0,
            height: isExpanded ? "auto" : 0,
            marginBottom: isExpanded ? 6 : 0,
          }}
          transition={fadeTransition}
          className="overflow-hidden px-2 text-xs font-medium text-muted-foreground"
        >
          {label}
        </motion.p>
      )}
      {collections.length > 0 && (
        <SidebarMenu className={isExpanded ? undefined : "gap-1"}>
          {collections.map((collection) => (
            <SidebarMenuItem key={collection.id}>
              <SidebarMenuButton
                asChild
                isActive={isCollectionActive(collection.id)}
                tooltip={collection.name}
                className="border border-transparent transition-colors hover:border-slate-200/90 hover:bg-white hover:text-slate-900 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04)] data-active:border-slate-200/90 data-active:bg-white data-active:text-slate-900 data-active:shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
              >
                <Link href={`/dashboard/collections/${collection.id}`}>
                  <FolderOpen />
                  <motion.span
                    initial={false}
                    animate={{
                      opacity: isExpanded ? 1 : 0,
                      maxWidth: isExpanded ? 180 : 0,
                    }}
                    transition={textTransition}
                    className="truncate overflow-hidden"
                  >
                    {collection.name}
                  </motion.span>
                </Link>
              </SidebarMenuButton>
              <motion.div
                initial={false}
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  scale: isExpanded ? 1 : 0.85,
                }}
                transition={fadeTransition}
                className="pointer-events-none absolute right-7 top-1.5"
              >
                <SidebarMenuBadge className="static text-muted-foreground">
                  {collection.item_count}
                </SidebarMenuBadge>
              </motion.div>
              {isExpanded && <CollectionRowMenu collection={collection} />}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      )}
    </div>
  );
}
