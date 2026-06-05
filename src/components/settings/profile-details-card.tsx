"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@source/stores";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const MEMBER_SINCE = "May 2026";

export function ProfileDetailsCard() {
  const hydrated = useSettingsStore((state) => state.hydrated);
  const displayName = useSettingsStore((state) => state.displayName);
  const email = useSettingsStore((state) => state.email);
  const setDisplayName = useSettingsStore((state) => state.setDisplayName);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(displayName);

  useEffect(() => {
    if (!editingName) setNameDraft(displayName);
  }, [displayName, editingName]);

  const name = displayName.trim() || "Your name";

  function startEditName() {
    setNameDraft(displayName);
    setEditingName(true);
  }

  function saveName() {
    setDisplayName(nameDraft.trim());
    setEditingName(false);
  }

  function cancelName() {
    setNameDraft(displayName);
    setEditingName(false);
  }

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-6">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-amber-300 text-lg font-semibold text-amber-950"
          aria-hidden
        >
          {initialsFromName(name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">{name}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{email}</p>
        </div>
      </div>

      <div className="grid gap-5 border-t border-slate-100 px-5 py-5 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">Name</p>
          {editingName ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Input
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                className="h-8 max-w-xs rounded-lg border-slate-200 text-sm"
                autoFocus
                disabled={!hydrated}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveName();
                  if (event.key === "Escape") cancelName();
                }}
              />
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-lg px-2.5 text-xs"
                onClick={saveName}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg px-2.5 text-xs"
                onClick={cancelName}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-medium text-slate-900">{name}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 shrink-0 text-slate-500 hover:text-slate-900"
                aria-label="Edit name"
                onClick={startEditName}
                disabled={!hydrated}
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">Member since</p>
          <p className="mt-1.5 text-sm font-medium text-slate-900">
            {MEMBER_SINCE}
          </p>
        </div>
      </div>
    </section>
  );
}

interface ProfileDetailsHeadingProps {
  className?: string;
}

export function ProfileDetailsHeading({ className }: ProfileDetailsHeadingProps) {
  return (
    <h2
      className={cn(
        "text-sm font-semibold text-slate-900",
        className
      )}
    >
      Profile Details
    </h2>
  );
}
