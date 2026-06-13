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
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-foreground hover:bg-slate-100"
          aria-label="Search scope"
        >
          <ActiveIcon className="size-3.5" />
          {active.label}
          <ChevronDown className="size-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-60">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setScope(option.value)}
              className="flex items-start gap-2.5"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-foreground/70" />
              <div className="flex-1">
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.hint}</div>
              </div>
              <Check
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  scope === option.value ? "opacity-100" : "opacity-0"
                )}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
