"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stashFieldClassName } from "@/components/dashboard/stash/stash-field-styles";
import { cn } from "@/lib/utils";
import { getStashUrlError } from "@/lib/validations/url";

export interface StashLinkFormState {
  url: string;
}

interface StashLinkPanelProps {
  form: StashLinkFormState;
  onChange: (patch: Partial<StashLinkFormState>) => void;
}

export function StashLinkPanel({ form, onChange }: StashLinkPanelProps) {
  const [touched, setTouched] = useState(false);
  const urlError = getStashUrlError(form.url);
  const showUrlError = touched && !!urlError;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Save a link</h2>
        <p className="mt-1 text-xs text-slate-500">
          Paste a link to turn it into a searchable memory.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stash-link-url" className="sr-only">
          URL
        </Label>
        <Input
          id="stash-link-url"
          type="url"
          placeholder="https://example.com"
          value={form.url}
          onChange={(event) => onChange({ url: event.target.value })}
          onBlur={() => setTouched(true)}
          aria-invalid={showUrlError}
          className={cn(
            "h-10 rounded-lg text-sm",
            stashFieldClassName,
            showUrlError &&
              "border-rose-300 bg-rose-50/30 focus-visible:border-rose-400 focus-visible:ring-rose-200/70"
          )}
        />
        {showUrlError ? (
          <p className="text-xs text-rose-500">{urlError}</p>
        ) : null}
      </div>
    </div>
  );
}
