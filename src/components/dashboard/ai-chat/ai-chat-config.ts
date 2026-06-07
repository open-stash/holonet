import type { LucideIcon } from "lucide-react";
import {
  Paperclip,
  Plug,
  Search,
  FolderOpen,
} from "lucide-react";

export type SearchModeId = "search";

export interface SearchModeOption {
  id: SearchModeId;
  label: string;
  icon: LucideIcon;
  locked?: boolean;
  badge?: string;
}

export interface AttachMenuOption {
  id: string;
  label: string;
  icon: LucideIcon;
  hasSubmenu?: boolean;
}

export const searchModeOptions: SearchModeOption[] = [
  { id: "search", label: "Search", icon: Search },
];

export const attachMenuOptions: AttachMenuOption[] = [
  { id: "upload", label: "Upload files or images", icon: Paperclip },
  { id: "connectors", label: "Connectors", icon: Plug, hasSubmenu: true },
  { id: "spaces", label: "Spaces", icon: FolderOpen, hasSubmenu: true },
];

export function getSearchModeLabel(id: SearchModeId) {
  return searchModeOptions.find((o) => o.id === id)?.label ?? "Search";
}
