import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceTypeTagProps {
  icon: LucideIcon;
  label: string;
  floating?: boolean;
}

export function SourceTypeTag({ icon: Icon, label, floating = true }: SourceTypeTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10.5px] font-medium tracking-wide",
        floating
          ? "absolute left-2 top-2 bg-white/85 text-slate-700 shadow-sm ring-1 ring-black/[0.06] backdrop-blur-md"
          : "border border-slate-200/80 bg-slate-100 text-slate-600"
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}
