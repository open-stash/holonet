"use client";

import { useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stashFieldClassName } from "@/components/dashboard/stash/stash-field-styles";
import { cn } from "@/lib/utils";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

// extension → MIME type (used when the browser doesn't set file.type)
export const ACCEPTED_UPLOAD: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export const ACCEPTED_EXT = Object.keys(ACCEPTED_UPLOAD)
  .map((e) => `.${e}`)
  .join(",");

export function fileContentType(file: File): string | null {
  if (file.type && Object.values(ACCEPTED_UPLOAD).includes(file.type)) {
    return file.type;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_UPLOAD[ext] ?? null;
}

export interface StashUploadFormState {
  files: File[];
  title: string;
  description: string;
}

interface StashUploadPanelProps {
  form: StashUploadFormState;
  onChange: (patch: Partial<StashUploadFormState>) => void;
}

function fileError(file: File): string | null {
  if (!fileContentType(file)) return "Unsupported type";
  if (file.size > MAX_UPLOAD_BYTES) return "Too large (max 25 MB)";
  return null;
}

export function StashUploadPanel({ form, onChange }: StashUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    onChange({ files: [...form.files, ...Array.from(fileList)] });
  }

  function handleDragOver(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function removeFile(index: number) {
    onChange({ files: form.files.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Upload</h2>
        <p className="mt-1 text-xs text-slate-500">
          Add documents to your stash.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXT}
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-9 text-center transition-all",
          isDragging
            ? "border-primary/40 bg-primary/5 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
            : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-100/80"
        )}
      >
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full transition-colors",
            isDragging
              ? "bg-primary/10 text-primary"
              : "bg-white text-slate-500 ring-1 ring-slate-200 group-hover:text-slate-700 group-hover:ring-slate-300"
          )}
        >
          <FileUp className="size-5" strokeWidth={1.75} />
        </span>
        <div className="space-y-1">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">Click to upload</span>
            {" or drag and drop"}
          </p>
          <p className="text-xs text-slate-500">PDF, Word, or PowerPoint · max 25 MB</p>
        </div>
      </button>

      {form.files.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-2">
          {form.files.map((file, index) => {
            const err = fileError(file);
            return (
              <li
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center gap-2 rounded-md px-1.5 py-1 text-xs"
              >
                <span className="min-w-0 flex-1 truncate text-slate-600">
                  {file.name}
                </span>
                {err ? (
                  <span className="shrink-0 font-medium text-rose-500">{err}</span>
                ) : (
                  <span className="shrink-0 text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="shrink-0 text-slate-400 hover:text-slate-700"
                >
                  <X className="size-3.5" />
                  <span className="sr-only">Remove {file.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stash-file-title" className="text-xs text-slate-600">
          Title <span className="text-slate-400">(optional — defaults to file name)</span>
        </Label>
        <Input
          id="stash-file-title"
          placeholder="Add a title"
          value={form.title}
          onChange={(event) => onChange({ title: event.target.value })}
          className={cn("h-9 rounded-lg text-sm", stashFieldClassName)}
        />
      </div>
    </div>
  );
}
