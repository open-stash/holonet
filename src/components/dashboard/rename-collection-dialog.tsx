"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCollectionSchema,
  type CreateCollectionFormValues,
} from "@/lib/validations/collection";
import { useCollectionsStore } from "@source/stores";

export function RenameCollectionDialog() {
  const renameTarget = useCollectionsStore((state) => state.renameTarget);
  const closeRenameDialog = useCollectionsStore((state) => state.closeRenameDialog);
  const renameCollection = useCollectionsStore((state) => state.renameCollection);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCollectionFormValues>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (renameTarget) {
      reset({ name: renameTarget.name });
    }
  }, [renameTarget, reset]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) closeRenameDialog();
  }

  async function onSubmit(values: CreateCollectionFormValues) {
    if (!renameTarget) return;
    renameCollection(renameTarget.id, values.name);
    toast.success("Collection renamed", {
      description: `Now called "${values.name}".`,
    });
  }

  return (
    <Dialog open={!!renameTarget} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 border-slate-200/80 bg-white p-0 shadow-lg sm:max-w-sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="flex flex-col gap-4 px-5 pt-5 pb-4">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Rename collection
            </DialogTitle>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rename-collection-name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="rename-collection-name"
                placeholder="Collection name"
                autoComplete="off"
                autoFocus
                maxLength={100}
                aria-invalid={!!errors.name}
                className="h-10 rounded-lg border-slate-200 bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/15"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => closeRenameDialog()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
