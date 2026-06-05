"use client";

import { FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useCollectionsStore,
  useSettingsStore,
  useSourcesStore,
} from "@source/stores";
import { sourceTitle } from "./source-helpers";

export function MoveSourceDialog() {
  const moveTargetId = useSourcesStore((state) => state.moveTargetId);
  const items = useSourcesStore((state) => state.items);
  const closeMoveDialog = useSourcesStore((state) => state.closeMoveDialog);
  const moveSourceToCollection = useSourcesStore(
    (state) => state.moveSourceToCollection
  );
  const collections = useCollectionsStore((state) => state.collections);
  const stashToasts = useSettingsStore((state) => state.stashToasts);

  const source = items.find((item) => item.id === moveTargetId);
  const title = source ? sourceTitle(source) : "";
  const destinations = source
    ? collections.filter((collection) => collection.id !== source.collection_id)
    : [];

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) closeMoveDialog();
  }

  async function handleSelect(collectionId: string, collectionName: string) {
    if (!source) return;
    try {
      await moveSourceToCollection(source.id, collectionId);
      if (stashToasts) {
        toast.success("Moved to collection", {
          description: `"${title}" is now in ${collectionName}.`,
        });
      }
    } catch {
      toast.error("Couldn't move source", {
        description: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <Dialog open={!!moveTargetId} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 border-slate-200/80 bg-white p-0 shadow-lg sm:max-w-sm"
      >
        <div className="flex flex-col gap-4 px-5 pt-5 pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Move to collection
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Choose where to move &ldquo;{title}&rdquo;.
            </DialogDescription>
          </div>

          {destinations.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm text-muted-foreground">
              No other collections yet. Create one from the sidebar.
            </p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {destinations.map((collection) => (
                <li key={collection.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-10 w-full justify-start gap-2.5 px-3 text-sm font-medium",
                      "hover:bg-slate-100"
                    )}
                    onClick={() =>
                      handleSelect(collection.id, collection.name)
                    }
                  >
                    <FolderOpen className="size-4 shrink-0 text-slate-500" />
                    <span className="truncate">{collection.name}</span>
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                      {collection.item_count}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={closeMoveDialog}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
