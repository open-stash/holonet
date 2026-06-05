"use client";

import {
  MoreHorizontal,
  Pencil,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Collection } from "@/types/kyber";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import { useCollectionsStore, useSettingsStore } from "@source/stores";

interface CollectionRowMenuProps {
  collection: Collection;
}

export function CollectionRowMenu({ collection }: CollectionRowMenuProps) {
  const toggleFavorite = useCollectionsStore((state) => state.toggleFavorite);
  const openRenameDialog = useCollectionsStore((state) => state.openRenameDialog);
  const removeCollection = useCollectionsStore((state) => state.removeCollection);
  const confirmBeforeDelete = useSettingsStore(
    (state) => state.confirmBeforeDelete
  );
  const stashToasts = useSettingsStore((state) => state.stashToasts);

  function handleShare() {
    toast.message("Share link copied", {
      description: `A share link for "${collection.name}" will be available soon.`,
    });
  }

  async function handleToggleFavorite() {
    const wasFavorite = collection.is_favorite;
    try {
      await toggleFavorite(collection.id);
      if (stashToasts) {
        toast.success(
          wasFavorite ? "Removed from favourites" : "Added to favourites",
          { description: collection.name }
        );
      }
    } catch {
      toast.error("Couldn't update favourite", {
        description: "Something went wrong. Please try again.",
      });
    }
  }

  function handleRename() {
    openRenameDialog(collection.id);
  }

  async function handleMoveToBin() {
    if (
      confirmBeforeDelete &&
      !window.confirm(`Move "${collection.name}" to the bin?`)
    ) {
      return;
    }
    try {
      await removeCollection(collection.id);
      if (stashToasts) {
        toast.success("Moved to bin", {
          description: `"${collection.name}" was removed.`,
        });
      }
    } catch {
      toast.error("Couldn't delete collection", {
        description: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          showOnHover
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal />
          <span className="sr-only">Collection actions</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="min-w-44">
        <DropdownMenuItem onSelect={handleShare}>
          <Share2 />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleToggleFavorite}>
          <Star />
          {collection.is_favorite ? "Remove from favourites" : "Add to favourites"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleRename}>
          <Pencil />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={handleMoveToBin}
        >
          <Trash2 />
          Move to bin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
