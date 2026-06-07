"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { StashDialogSidebar } from "@/components/dashboard/stash/stash-dialog-sidebar";
import {
  type StashLinkFormState,
  StashLinkPanel,
} from "@/components/dashboard/stash/stash-link-panel";
import { StashNotePanel } from "@/components/dashboard/stash/stash-note-panel";
import {
  type StashUploadFormState,
  StashUploadPanel,
  MAX_UPLOAD_BYTES,
  fileContentType,
} from "@/components/dashboard/stash/stash-upload-panel";
import type { StashMode } from "@/components/dashboard/stash/stash-dialog-types";
import {
  useCollectionsStore,
  useSettingsStore,
  useSourcesStore,
  useStashStore,
} from "@source/stores";
import {
  createSource,
  presignUpload,
  uploadFileToS3,
  confirmUpload,
} from "@/lib/api/kyber";
import type { SourceType } from "@/components/dashboard/mock";
import { isValidStashUrl, normalizeStashUrl } from "@/lib/validations/url";

// Map an uploaded file's extension to a source card type, for the optimistic card.
function inferUploadType(filename: string): SourceType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "ppt" || ext === "pptx") return "ppt";
  return "doc";
}

const emptyLinkForm = (): StashLinkFormState => ({
  url: "",
});

// Must match kyber's note content limit (CreateSourceRequest content max=10000).
const NOTE_MAX_CHARS = 10000;

const emptyUploadForm = (): StashUploadFormState => ({
  files: [],
  title: "",
  description: "",
});

export function CreateStashDialog() {
  const open = useStashStore((state) => state.open);
  const setOpen = useStashStore((state) => state.setOpen);
  const stashToasts = useSettingsStore((state) => state.stashToasts);
  const collections = useCollectionsStore((state) => state.collections);

  // Save a link is the default mode.
  const [mode, setMode] = useState<StashMode>("link");
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [linkForm, setLinkForm] = useState<StashLinkFormState>(emptyLinkForm);
  const [uploadForm, setUploadForm] =
    useState<StashUploadFormState>(emptyUploadForm);
  const [submitting, setSubmitting] = useState(false);

  const pathname = usePathname();
  const routeCollectionId =
    pathname.match(/^\/dashboard\/collections\/([^/]+)/)?.[1] ?? "";

  useEffect(() => {
    if (!open) return;
    setMode("link");
    setSelectedCollectionId(routeCollectionId || "");
  }, [open, routeCollectionId]);

  useEffect(() => {
    if (!open || selectedCollectionId || routeCollectionId) return;
    if (collections[0]?.id) setSelectedCollectionId(collections[0].id);
  }, [open, selectedCollectionId, routeCollectionId, collections]);

  function resetForm() {
    setMode("link");
    setNoteBody("");
    setLinkForm(emptyLinkForm());
    setUploadForm(emptyUploadForm());
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  function closeWithSuccess(message: string) {
    if (stashToasts) toast.success(message);
    setOpen(false);
    resetForm();
  }

  async function handleSubmit() {
    if (!selectedCollectionId) return;

    if (mode === "note") {
      if (!noteBody.trim() || noteBody.length > NOTE_MAX_CHARS) return;
      setSubmitting(true);
      try {
        const newNote = await createSource({
          collection_id: selectedCollectionId,
          type: "note",
          content: noteBody,
        });
        useSourcesStore.getState().addSourceOptimistic(newNote);
        void useCollectionsStore.getState().fetchCollections();
        closeWithSuccess("Note saved to your stash");
      } catch (err) {
        toast.error("Couldn't save note", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (mode === "link") {
      if (!isValidStashUrl(linkForm.url)) return;
      setSubmitting(true);
      try {
        const newLink = await createSource({
          collection_id: selectedCollectionId,
          type: "link",
          original_url: normalizeStashUrl(linkForm.url),
        });
        // Show the card immediately (status "pending"); the poll fills the thumbnail.
        useSourcesStore.getState().addSourceOptimistic(newLink);
        // Refresh collections so the sidebar item_count reflects the new source
        void useCollectionsStore.getState().fetchCollections();
        closeWithSuccess("Link saved to your stash");
      } catch (err) {
        toast.error("Couldn't save link", {
          description:
            err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // upload mode
    const valid = uploadForm.files.filter(
      (f) => fileContentType(f) && f.size <= MAX_UPLOAD_BYTES
    );
    if (valid.length === 0) return;

    setSubmitting(true);
    let ok = 0;
    const failed: string[] = [];
    for (const file of valid) {
      const contentType = fileContentType(file)!;
      try {
        const presigned = await presignUpload({
          filename: file.name,
          content_type: contentType,
          collection_id: selectedCollectionId,
          title: uploadForm.title.trim() || file.name,
          size: file.size,
        });
        await uploadFileToS3(presigned.upload_url, file, contentType);
        await confirmUpload(presigned.source_id);
        // Optimistic card (we only get source_id back from confirm); poll reconciles.
        useSourcesStore.getState().addSourceOptimistic({
          id: presigned.source_id,
          user_id: "",
          collection_id: selectedCollectionId,
          type: inferUploadType(file.name),
          status: "pending",
          title: uploadForm.title.trim() || file.name,
          created_at: new Date().toISOString(),
        });
        ok += 1;
      } catch {
        failed.push(file.name);
      }
    }
    setSubmitting(false);

    if (ok > 0) {
      void useCollectionsStore.getState().fetchCollections();
    }
    if (failed.length > 0) {
      toast.error(`Couldn't upload ${failed.length} file(s)`, {
        description: failed.join(", "),
      });
      if (ok === 0) return; // keep dialog open so the user can retry
    }
    closeWithSuccess(ok === 1 ? "File uploaded" : `${ok} files uploaded`);
  }

  const submitLabel =
    mode === "note"
      ? "Add note"
      : mode === "link"
        ? "Stash link"
        : "Stash";

  const uploadValid =
    uploadForm.files.length > 0 &&
    uploadForm.files.every(
      (f) => fileContentType(f) && f.size <= MAX_UPLOAD_BYTES
    );

  const canSubmit =
    !!selectedCollectionId &&
    (mode === "note"
      ? noteBody.trim().length > 0 && noteBody.length <= NOTE_MAX_CHARS
      : mode === "link"
        ? isValidStashUrl(linkForm.url)
        : uploadValid);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[min(32rem,88vh)] max-h-[88vh] flex-col gap-0 overflow-hidden rounded-2xl border border-[#F5F6FA] bg-white p-0 shadow-[0_4px_24px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)] ring-0 sm:max-w-3xl">
        <DialogTitle className="sr-only">Add to stash</DialogTitle>

        <div className="flex min-h-0 flex-1">
          <StashDialogSidebar
            mode={mode}
            onModeChange={setMode}
            collections={collections}
            selectedCollectionId={selectedCollectionId}
            onCollectionChange={setSelectedCollectionId}
          />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
              {mode === "note" && (
                <StashNotePanel
                  value={noteBody}
                  onChange={setNoteBody}
                  maxLength={NOTE_MAX_CHARS}
                />
              )}
              {mode === "link" && (
                <StashLinkPanel
                  form={linkForm}
                  onChange={(patch) =>
                    setLinkForm((current) => ({ ...current, ...patch }))
                  }
                />
              )}
              {mode === "upload" && (
                <StashUploadPanel
                  form={uploadForm}
                  onChange={(patch) =>
                    setUploadForm((current) => ({ ...current, ...patch }))
                  }
                />
              )}
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 items-center border-t border-[#F5F6FA] bg-white">
          <div className="w-56 shrink-0" aria-hidden />

          <div className="flex flex-1 items-center justify-end gap-2 px-5 py-3">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-600"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
            >
              {submitting
                ? mode === "upload"
                  ? "Uploading…"
                  : "Stashing…"
                : submitLabel}
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
