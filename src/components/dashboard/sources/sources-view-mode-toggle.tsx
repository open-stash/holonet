"use client";

import { LayoutGrid, Layers, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CollectionViewMode } from "./use-collection-view-mode";

const modes: {
  value: CollectionViewMode;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { value: "cards", label: "Cards", icon: LayoutGrid },
  { value: "grouped", label: "Grouped", icon: Layers },
  { value: "list", label: "List", icon: List },
];

interface SourcesViewModeToggleProps {
  value: CollectionViewMode;
  onChange: (value: CollectionViewMode) => void;
}

export function SourcesViewModeToggle({
  value,
  onChange,
}: SourcesViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-[10px] border border-slate-200 bg-slate-100 p-1">
      {modes.map(({ value: mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
            value === mode && "bg-white text-foreground"
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
