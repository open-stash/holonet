"use client";

import { stashFieldClassName } from "@/components/dashboard/stash/stash-field-styles";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface StashNotePanelProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}

export function StashNotePanel({ value, onChange, maxLength }: StashNotePanelProps) {
  const overLimit = value.length > maxLength;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-900">Write a note</h2>
      <p className="text-xs text-slate-500">
        Capture ideas, meeting notes, or anything you want to find later.
      </p>

      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder="Write, paste anything, or start typing…"
        className={cn(
          "min-h-[min(16rem,40vh)] resize-none rounded-xl px-3 py-3 text-sm leading-relaxed",
          stashFieldClassName
        )}
      />
      <p
        className={cn(
          "self-end text-[11px] tabular-nums",
          overLimit ? "text-rose-500" : "text-slate-400"
        )}
      >
        {value.length.toLocaleString()} / {maxLength.toLocaleString()}
      </p>
    </div>
  );
}
