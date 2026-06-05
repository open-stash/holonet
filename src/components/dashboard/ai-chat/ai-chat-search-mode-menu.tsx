"use client";

import { Search } from "lucide-react";

export function AiChatSearchModeMenu() {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-foreground">
      <Search className="size-3.5" />
      Search
    </span>
  );
}
