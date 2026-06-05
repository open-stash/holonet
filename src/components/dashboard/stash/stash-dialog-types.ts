export type StashMode = "note" | "link" | "upload";

export interface StashModeOption {
  id: StashMode;
  title: string;
  description: string;
}

export const stashModeOptions: StashModeOption[] = [
  {
    id: "link",
    title: "Save a link",
    description: "Add any webpage to your searchable stash",
  },
  {
    id: "note",
    title: "Write a note",
    description: "Save thoughts, notes, and summaries to your stash",
  },
  {
    id: "upload",
    title: "Upload",
    description: "Turn images, PDFs, documents, and markdown into stash items",
  },
];
