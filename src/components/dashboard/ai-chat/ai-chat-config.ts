import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";

export type SearchModeId = "search";

export interface SearchModeOption {
  id: SearchModeId;
  label: string;
  icon: LucideIcon;
  locked?: boolean;
  badge?: string;
}

export const searchModeOptions: SearchModeOption[] = [
  { id: "search", label: "Search", icon: Search },
];

export function getSearchModeLabel(id: SearchModeId) {
  return searchModeOptions.find((o) => o.id === id)?.label ?? "Search";
}
