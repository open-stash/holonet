"use client";

import { useCallback, useEffect, useState } from "react";
import { Laptop, LogOut, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getSessions,
  revokeOtherSessions,
  revokeSession,
  type SessionInfo,
} from "@/lib/api/sessions";
import { cn } from "@/lib/utils";

const cardClass =
  "rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

function deviceIcon(device: string) {
  const d = device.toLowerCase();
  if (/(mobile|phone|android|iphone)/.test(d)) return Smartphone;
  if (/(tablet|ipad)/.test(d)) return Monitor;
  return Laptop;
}

function sessionLabel(session: SessionInfo) {
  const browser = session.browser || "Unknown browser";
  return session.os ? `${browser} · ${session.os}` : browser;
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

function DeviceIconBox({ icon: Icon }: { icon: typeof Laptop }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <Icon className="size-5" />
    </span>
  );
}

function SessionRowSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <li className={cn("flex items-center gap-4 p-5", !withAction && "border-b border-slate-100 last:border-0")}>
      <Skeleton className="size-12 shrink-0 rounded-xl bg-slate-100" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-4 w-40 max-w-[70%] rounded bg-slate-100" />
          {!withAction && (
            <Skeleton className="h-5 w-20 shrink-0 rounded-full bg-slate-100" />
          )}
        </div>
        <Skeleton className="h-3 w-28 rounded bg-slate-100" />
      </div>
      {withAction ? (
        <Skeleton className="h-8 w-20 shrink-0 rounded-lg bg-slate-100" />
      ) : null}
    </li>
  );
}

function SessionsListSkeleton() {
  return (
    <div className={cn(cardClass, "overflow-hidden")} aria-busy="true" aria-label="Loading sessions">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <Skeleton className="h-3.5 w-28 rounded bg-slate-100" />
      </div>
      <ul>
        <SessionRowSkeleton />
        <SessionRowSkeleton withAction />
      </ul>
    </div>
  );
}

function SessionRow({
  session,
  busy,
  onRevoke,
}: {
  session: SessionInfo;
  busy: string | null;
  onRevoke: (id: string) => void;
}) {
  const Icon = deviceIcon(session.device);
  const isCurrent = session.current;

  return (
    <li
      className={cn(
        "relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center",
        "border-b border-slate-100 last:border-0",
        isCurrent && "bg-emerald-50/30"
      )}
    >
      {isCurrent && (
        <span
          className="absolute inset-y-0 left-0 w-0.5 rounded-r bg-emerald-500"
          aria-hidden
        />
      )}

      <div className="flex min-w-0 flex-1 items-start gap-4">
        <DeviceIconBox icon={Icon} />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {sessionLabel(session)}
            </p>
            {isCurrent && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10 ring-inset">
                This device
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {isCurrent ? "Active now" : `Last active ${timeAgo(session.last_seen)}`}
          </p>
        </div>
      </div>

      {isCurrent ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/10 ring-inset sm:self-center">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
          Online
        </span>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy !== null}
          onClick={() => onRevoke(session.id)}
          className="h-8 shrink-0 self-start rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 sm:self-center"
        >
          <LogOut className="size-3.5" />
          {busy === session.id ? "Signing out…" : "Sign out"}
        </Button>
      )}
    </li>
  );
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

  const list = [...(sessions ?? [])].sort(
    (a, b) => Number(b.current) - Number(a.current)
  );
  const hasOthers = list.some((s) => !s.current);

  return (
    <div className="flex flex-1 flex-col p-8">
      <SettingsPageHeader
        title="Devices & sessions"
        description="Devices currently signed in to your account. Revoke any you don't recognise."
      />

      <div className="flex max-w-2xl flex-col gap-4">
        {sessions === null ? (
          <SessionsListSkeleton />
        ) : list.length === 0 ? (
          <div
            className={cn(
              cardClass,
              "flex flex-col items-center border-dashed bg-slate-50/50 px-6 py-12 text-center"
            )}
          >
            <span className="mb-3 flex size-12 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <Laptop className="size-5" />
            </span>
            <p className="text-sm font-medium text-slate-700">No active sessions</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              When you sign in on a device, it will show up here.
            </p>
          </div>
        ) : (
          <>
            <div className={cn(cardClass, "overflow-hidden")}>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                <p className="text-xs font-medium text-slate-500">
                  {list.length} active {list.length === 1 ? "session" : "sessions"}
                </p>
              </div>
              <ul>
                {list.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    busy={busy}
                    onRevoke={handleRevoke}
                  />
                ))}
              </ul>
            </div>

            {hasOthers && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={handleRevokeOthers}
                className="h-9 self-start rounded-lg border-slate-200 bg-white text-slate-700 shadow-none"
              >
                {busy === "others" ? "Signing out…" : "Sign out of all other devices"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
