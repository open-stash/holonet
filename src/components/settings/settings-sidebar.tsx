"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight, LogOut, ShieldAlert } from "lucide-react";
import { logoutUser } from "@/lib/api/auth";
import {
  dangerZoneHref,
  settingsNavItems,
} from "@/components/settings/settings-nav";
import { cn } from "@/lib/utils";

export function SettingsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutUser();
    router.push("/login");
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200/80 bg-white px-2 py-4">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Organisation
      </p>

      <nav className="flex flex-col gap-0.5">
        {settingsNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-50 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900"
              )}
            >
              {isActive && (
                <span
                  className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-slate-900"
                  aria-hidden
                />
              )}
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  isActive ? "text-slate-900" : "text-slate-500"
                )}
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-slate-100 pt-3">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
        >
          <LogOut className="size-4 shrink-0 text-slate-500" />
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
        <Link
          href={dangerZoneHref}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === dangerZoneHref
              ? "bg-rose-50 text-rose-700"
              : "text-rose-600 hover:bg-rose-50/80"
          )}
        >
          <ShieldAlert className="size-4 shrink-0" />
          <span className="flex-1 truncate">Danger zone</span>
          <ChevronRight className="size-4 shrink-0 opacity-60" />
        </Link>
      </div>
    </aside>
  );
}
