"use client";

import { useCallback, useEffect, useState } from "react";
import { Laptop, Loader2, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import {
  getSessions,
  revokeOtherSessions,
  revokeSession,
  type SessionInfo,
} from "@/lib/api/sessions";
import { cn } from "@/lib/utils";

function deviceIcon(device: string) {
  const d = device.toLowerCase();
  if (/(mobile|phone|android|iphone)/.test(d)) return Smartphone;
  if (/(tablet|ipad)/.test(d)) return Monitor;
  return Laptop;
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function SessionsSettingsPanel() {
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setSessions(await getSessions());
    } catch {
      toast.error("Couldn't load your sessions");
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRevoke(id: string) {
    setBusy(id);
    try {
      await revokeSession(id);
      toast.success("Device signed out");
      await load();
    } catch {
      toast.error("Couldn't sign out that device");
    } finally {
      setBusy(null);
    }
  }

  async function handleRevokeOthers() {
    setBusy("others");
    try {
      await revokeOtherSessions();
      toast.success("Signed out of all other devices");
      await load();
    } catch {
      toast.error("Couldn't sign out other devices");
    } finally {
      setBusy(null);
    }
  }

  const hasOthers = (sessions ?? []).some((s) => !s.current);

  return (
    <div className="flex flex-1 flex-col p-8">
      <SettingsPageHeader
        title="Devices & sessions"
        description="Devices currently signed in to your account. Revoke any you don't recognise."
      />

      <div className="flex max-w-2xl flex-col gap-3">
        {sessions === null ? (
          <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" /> Loading sessions…
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-10 text-sm text-slate-500">No active sessions.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {sessions.map((s) => {
                const Icon = deviceIcon(s.device);
                return (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {s.browser || "Unknown browser"}
                          {s.os ? ` · ${s.os}` : ""}
                        </p>
                        {s.current && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            This device
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                        active {timeAgo(s.last_seen)}
                      </p>
                    </div>
                    {!s.current && (
                      <button
                        onClick={() => handleRevoke(s.id)}
                        disabled={busy !== null}
                        className={cn(
                          "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                          "text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        )}
                      >
                        {busy === s.id ? "Signing out…" : "Sign out"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            {hasOthers && (
              <button
                onClick={handleRevokeOthers}
                disabled={busy !== null}
                className="mt-2 self-start rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {busy === "others" ? "Signing out…" : "Sign out of all other devices"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
