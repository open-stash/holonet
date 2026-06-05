"use client";

import { useEffect, useState } from "react";
import { FolderOpen, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Collection } from "@/types/kyber";
import {
  getBinCollections,
  restoreCollection,
  permanentDeleteCollection,
} from "@/lib/api/kyber";
import { useCollectionsStore } from "@source/stores";

interface BinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BinDialog({ open, onOpenChange }: BinDialogProps) {
  const [items, setItems] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);
  const fetchCollections = () => useCollectionsStore.getState().fetchCollections();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getBinCollections()
      .then(setItems)
      .catch(() => toast.error("Couldn't load bin"))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleRestore(collection: Collection) {
    setActionInFlight(collection.id);
    try {
      await restoreCollection(collection.id);
      setItems((prev) => prev.filter((c) => c.id !== collection.id));
      await fetchCollections();
      toast.success("Restored", { description: `"${collection.name}" is back in your collections.` });
    } catch {
      toast.error("Couldn't restore collection");
    } finally {
      setActionInFlight(null);
    }
  }

  async function handlePermanentDelete(collection: Collection) {
    if (!window.confirm(`Permanently delete "${collection.name}"? This cannot be undone.`)) return;
    setActionInFlight(collection.id);
    try {
      await permanentDeleteCollection(collection.id);
      setItems((prev) => prev.filter((c) => c.id !== collection.id));
      toast.success("Deleted permanently", { description: `"${collection.name}" has been removed.` });
    } catch {
      toast.error("Couldn't delete collection");
    } finally {
      setActionInFlight(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 border-slate-200/80 bg-white p-0 shadow-lg sm:max-w-md"
      >
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4">
          <DialogTitle className="text-base font-semibold tracking-tight">Bin</DialogTitle>
          <p className="text-[13px] text-muted-foreground">
            Collections moved to bin. Restore or delete permanently.
          </p>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <span className="text-[13px] text-muted-foreground">Loading…</span>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <Trash2 className="size-8 text-slate-200" />
              <p className="text-[13px] text-muted-foreground">Bin is empty</p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {items.map((collection) => {
                const busy = actionInFlight === collection.id;
                return (
                  <li
                    key={collection.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <FolderOpen className="size-4 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-slate-700">
                      {collection.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => handleRestore(collection)}
                        className="h-7 gap-1.5 px-2 text-[12px] text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <RotateCcw className="size-3.5" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => handlePermanentDelete(collection)}
                        className="h-7 gap-1.5 px-2 text-[12px] text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
