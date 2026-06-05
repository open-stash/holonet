"use client";

import { FileText, FolderOpen, Globe, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Collection } from "@/types/kyber";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  stashModeOptions,
  type StashMode,
} from "@/components/dashboard/stash/stash-dialog-types";

const modeIcons: Record<StashMode, LucideIcon> = {
  note: FileText,
  link: Globe,
  upload: Upload,
};

interface StashDialogSidebarProps {
  mode: StashMode;
  onModeChange: (mode: StashMode) => void;
  collections: Collection[];
  selectedCollectionId: string;
  onCollectionChange: (collectionId: string) => void;
}

export function StashDialogSidebar({
  mode,
  onModeChange,
  collections,
  selectedCollectionId,
  onCollectionChange,
}: StashDialogSidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[#F5F6FA] bg-white">
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Add to stash
        </p>
        {stashModeOptions.map((option) => {
          const Icon = modeIcons[option.id];
          const isActive = mode === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onModeChange(option.id)}
              className={cn(
                "flex w-full gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-[#F5F6FA] text-slate-900 shadow-none"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  isActive ? "text-slate-900" : "text-slate-500"
                )}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center px-2 pb-3 pt-1">
        {collections.length === 0 ? (
          <p className="text-[11px] leading-snug text-slate-500">
            Create a collection first.
          </p>
        ) : (
          <Select
            value={selectedCollectionId}
            onValueChange={onCollectionChange}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-auto max-w-full gap-1 rounded-lg border-slate-200 bg-slate-50/80 px-2 text-xs font-medium text-slate-700 shadow-none hover:border-slate-300 hover:bg-slate-100 [&_svg:not([class*='size-'])]:size-3.5"
            >
              <span className="flex max-w-38 items-center gap-1.5">
                <FolderOpen className="size-3.5 shrink-0 text-slate-400" />
                <SelectValue placeholder="Pick collection" />
              </span>
            </SelectTrigger>
            <SelectContent align="start" className="min-w-(--radix-select-trigger-width)">
              {collections.map((collection) => (
                <SelectItem
                  key={collection.id}
                  value={collection.id}
                  className="py-1.5 pl-2 text-xs"
                >
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </aside>
  );
}
