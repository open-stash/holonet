"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SearchScope } from "@/lib/api/holocron";
import { useChatStore } from "@source/stores";

const OPTIONS: { value: SearchScope; label: string; hint: string }[] = [
  { value: "best", label: "Best", hint: "Stash, memory & connections" },
  { value: "stash", label: "Stash", hint: "Your saved links, notes & files" },
  { value: "memory", label: "Memory", hint: "What I've learned about you" },
];

export function AiChatSearchModeMenu() {
  const scope = useChatStore((s) => s.scope);
  const setScope = useChatStore((s) => s.setScope);
  const active = OPTIONS.find((o) => o.value === scope) ?? OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 pl-3 pr-2 text-xs font-medium text-foreground transition-colors hover:bg-slate-100"
          aria-label="Search scope"
        >
          {active.label}
          <ChevronDown className="size-3 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-64 rounded-xl border-slate-200/80 p-1 shadow-lg shadow-slate-900/[0.06]"
      >
        {OPTIONS.map((option) => {
          const selected = scope === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setScope(option.value)}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 focus:bg-slate-100"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium leading-tight text-foreground">
                  {option.label}
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {option.hint}
                </div>
              </div>
              <Check
                className={cn(
                  "size-4 shrink-0 text-foreground",
                  selected ? "opacity-100" : "opacity-0"
                )}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
