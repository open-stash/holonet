import type { LucideIcon } from "lucide-react";
import {
  Paperclip,
  Plug,
  Search,
  FolderOpen,
} from "lucide-react";

export type SearchModeId = "search";

export type ModelId =
  | "sonar-2"
  | "gpt-5.4"
  | "gpt-5.5-max"
  | "gemini-3.1-pro"
  | "claude-sonnet-4.6"
  | "claude-opus-4.8-max";

export interface SearchModeOption {
  id: SearchModeId;
  label: string;
  icon: LucideIcon;
  locked?: boolean;
  badge?: string;
}

export interface ModelOption {
  id: ModelId;
  label: string;
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

export const modelOptions: ModelOption[] = [
  { id: "sonar-2", label: "Sonar 2" },
  { id: "gpt-5.4", label: "GPT-5.4" },
  { id: "gpt-5.5-max", label: "GPT-5.5", locked: true, badge: "Max" },
  { id: "gemini-3.1-pro", label: "Gemini 3.1 Pro" },
  { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
  {
    id: "claude-opus-4.8-max",
    label: "Claude Opus 4.8",
    locked: true,
    badge: "Max",
  },
];

export const attachMenuOptions: AttachMenuOption[] = [
  { id: "upload", label: "Upload files or images", icon: Paperclip },
  { id: "connectors", label: "Connectors", icon: Plug, hasSubmenu: true },
  { id: "spaces", label: "Spaces", icon: FolderOpen, hasSubmenu: true },
];

export function getSearchModeLabel(id: SearchModeId) {
  return searchModeOptions.find((o) => o.id === id)?.label ?? "Search";
}

export function getModelLabel(id: ModelId) {
  return modelOptions.find((o) => o.id === id)?.label ?? "GPT-5.4";
}
