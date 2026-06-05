"use client";

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

export function CreateCollectionDialog() {
  const open = useCollectionsStore((state) => state.createDialogOpen);
  const setOpen = useCollectionsStore((state) => state.setCreateDialogOpen);
  const addCollection = useCollectionsStore((state) => state.addCollection);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCollectionFormValues>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: { name: "" },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset({ name: "" });
    }
  }

  async function onSubmit(values: CreateCollectionFormValues) {
    try {
      const collection = await addCollection(values.name);
      toast.success("Collection created", {
        description: `"${collection.name}" is ready.`,
      });
      reset({ name: "" });
    } catch {
      toast.error("Failed to create collection", {
        description: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 border-slate-200/80 bg-white p-0 shadow-lg sm:max-w-sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="flex flex-col gap-4 px-5 pt-5 pb-4">
            <DialogTitle className="text-base font-semibold tracking-tight">
              New collection
            </DialogTitle>

            <div className="flex flex-col gap-2">
              <Label htmlFor="collection-name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="collection-name"
                placeholder="Research, Reading list…"
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
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
