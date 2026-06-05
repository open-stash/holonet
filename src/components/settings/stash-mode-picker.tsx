"use client";

import { FileText, Globe, Upload } from "lucide-react";
import type { StashMode } from "@source/stores";
import { cn } from "@/lib/utils";

const modes: {
  value: StashMode;
  label: string;
  icon: typeof FileText;
}[] = [
  { value: "note", label: "Note", icon: FileText },
  { value: "link", label: "Link", icon: Globe },
  { value: "upload", label: "Upload", icon: Upload },
];

interface StashModePickerProps {
  value: StashMode;
  onChange: (value: StashMode) => void;
}

export function StashModePicker({ value, onChange }: StashModePickerProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-[10px] border border-slate-200 bg-slate-100 p-1">
      {modes.map(({ value: mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
            value === mode && "bg-white text-foreground shadow-sm"
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
