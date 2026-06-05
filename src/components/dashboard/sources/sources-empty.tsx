"use client";

import { Inbox } from "lucide-react";

export function SourcesEmpty() {
  return (
    <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Inbox className="size-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">No items found</h3>
        <p className="text-sm text-muted-foreground">
          Try changing filters or add a new source to see it here.
        </p>
      </div>
    </div>
  );
}
