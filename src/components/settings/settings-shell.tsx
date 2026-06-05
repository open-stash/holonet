import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";

export function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-md outline-hidden ring-offset-2 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-slate-300"
        >
          <Image
            src="/logo.svg"
            alt="Open Stash"
            width={28}
            height={28}
            className="size-7 rounded-lg"
          />
          <span className="text-sm font-semibold text-slate-900">
            Open Stash
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Back to app
        </Link>
      </header>

      <div className="flex min-h-0 flex-1">
        <SettingsSidebar />
        <div className="min-w-0 flex-1 overflow-y-auto bg-slate-50/30">
          {children}
        </div>
      </div>
    </div>
  );
}
