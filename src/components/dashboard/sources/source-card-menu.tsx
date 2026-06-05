"use client";

import { Copy, FolderInput, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { MockSource } from "@/components/dashboard/mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSettingsStore, useSourcesStore } from "@source/stores";
import { sourceTitle } from "./source-helpers";

interface SourceCardMenuProps {
  source: MockSource;
  className?: string;
}

export function SourceCardMenu({ source, className }: SourceCardMenuProps) {
  const openMoveDialog = useSourcesStore((state) => state.openMoveDialog);
  const removeSource = useSourcesStore((state) => state.removeSource);
  const confirmBeforeDelete = useSettingsStore(
    (state) => state.confirmBeforeDelete
  );
  const stashToasts = useSettingsStore((state) => state.stashToasts);
  const title = sourceTitle(source);
  const canCopyLink = source.type === "link" && !!source.original_url;

  function handleCopyLink() {
    if (!source.original_url) return;
    void navigator.clipboard.writeText(source.original_url);
    if (stashToasts) {
      toast.success("Link copied", { description: source.original_url });
    }
  }

  function handleMove() {
    openMoveDialog(source.id);
  }

  async function handleDelete() {
    if (
      confirmBeforeDelete &&
      !window.confirm(`Delete "${title}"? This cannot be undone.`)
    ) {
      return;
    }
    try {
      await removeSource(source.id);
      if (stashToasts) {
        toast.success("Source deleted", { description: title });
      }
    } catch {
      toast.error("Couldn't delete source", {
        description: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "absolute right-2 bottom-2 z-10 p-1 text-muted-foreground",
            "opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100",
            "data-[state=open]:opacity-100",
            className
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Source actions</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="min-w-48">
        {canCopyLink ? (
          <DropdownMenuItem onSelect={handleCopyLink}>
            <Copy />
            Copy link
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={handleMove}>
          <FolderInput />
          Move to another collection
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
