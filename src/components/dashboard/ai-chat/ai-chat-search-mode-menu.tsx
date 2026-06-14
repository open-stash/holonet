"use client";

import { Brain, Check, ChevronDown, FileText, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SearchScope } from "@/lib/api/holocron";
import { useChatStore } from "@source/stores";

const OPTIONS: {
  value: SearchScope;
  label: string;
  hint: string;
  icon: typeof Sparkles;
}[] = [
  { value: "best", label: "Best", hint: "Stash, memory & connections", icon: Sparkles },
  { value: "stash", label: "Stash", hint: "Your saved links, notes & files", icon: FileText },
  { value: "memory", label: "Memory", hint: "What I've learned about you", icon: Brain },
];

export function AiChatSearchModeMenu() {
  const scope = useChatStore((s) => s.scope);
  const setScope = useChatStore((s) => s.setScope);
  const active = OPTIONS.find((o) => o.value === scope) ?? OPTIONS[0];
  const ActiveIcon = active.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 pl-2.5 pr-2 text-xs font-medium text-foreground transition-colors hover:bg-slate-100"
          aria-label="Search scope"
        >
          <ActiveIcon className="size-3.5 text-foreground/70" />
          {active.label}
          <ChevronDown className="size-3 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-72 rounded-2xl border-slate-200/80 p-1.5 shadow-lg shadow-slate-900/[0.06]"
      >
        <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          Search across
        </p>
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = scope === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setScope(option.value)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2 py-2 focus:bg-slate-100",
                selected && "bg-slate-100/70"
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                  selected
                    ? "border-transparent bg-foreground text-white"
                    : "border-slate-200 bg-white text-foreground/70"
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium leading-tight text-foreground">
                  {option.label}
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {option.hint}
                </div>
              </div>
              {selected && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-white">
                  <Check className="size-3 stroke-[3]" />
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
