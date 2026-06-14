"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { ConnectedAppsSection } from "@/components/settings/panels/connected-apps-section";
import { DefaultCollectionSection } from "@/components/settings/panels/default-collection-section";
import { probeApi, type Connector } from "@/lib/api/probe";
import { cn } from "@/lib/utils";

function statusMeta(status: string) {
  switch (status) {
    case "connected":
      return {
        label: "Connected",
        icon: CheckCircle2,
        badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
        iconCls: "text-emerald-600",
      };
    case "syncing":
      return {
        label: "Syncing…",
        icon: Loader2,
        badge: "bg-blue-50 text-blue-700 ring-blue-600/10",
        iconCls: "text-blue-600 animate-spin",
      };
    case "needs_reauth":
      return {
        label: "Reconnect needed",
        icon: AlertTriangle,
        badge: "bg-amber-50 text-amber-800 ring-amber-600/10",
        iconCls: "text-amber-600",
      };
    case "error":
      return {
        label: "Error",
        icon: AlertTriangle,
        badge: "bg-red-50 text-red-700 ring-red-600/10",
        iconCls: "text-red-600",
      };
    default:
      return {
        label: status,
        icon: CheckCircle2,
        badge: "bg-slate-100 text-slate-600 ring-slate-500/10",
        iconCls: "text-slate-500",
      };
  }
}

function relativeTime(iso?: string | null) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function NotionLogo({ size = 48 }: { size?: number }) {
  return (
    <span className="flex size-12 shrink-0 select-none items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <Image
        src="/connectors/faviconV2.png"
        alt="Notion"
        width={size}
        height={size}
        draggable={false}
        className="pointer-events-none size-8 rounded-md object-contain"
      />
    </span>
  );
}

export function ConnectionsSettingsPanel() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setConnectors(await probeApi.listConnectors());
      setError(null);
    } catch {
      setError("Couldn't load connectors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!connectors.some((c) => c.status === "syncing")) return;
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [connectors, refresh]);

  const notion = connectors.find((c) => c.provider === "notion");

  async function connectNotion() {
    setConnecting(true);
    setError(null);
    try {
      const { authorize_url } = await probeApi.startNotionConnect();
      window.location.assign(authorize_url);
    } catch {
      setError("Notion isn't configured on the server yet.");
      setConnecting(false);
    }
  }

  async function syncNow(id: string) {
    await probeApi.syncNow(id).catch(() => {});
    setTimeout(refresh, 800);
  }

  async function disconnect(c: Connector) {
    const purge = window.confirm(
      "Disconnect Notion.\n\nOK = also delete everything synced from Notion.\nCancel/keep = keep the synced items as normal collections."
    );
    await probeApi.disconnect(c.id, purge).catch(() => {});
    refresh();
  }

  const status = notion ? statusMeta(notion.status) : null;
  const StatusIcon = status?.icon;

  return (
    <div className="flex flex-1 flex-col p-8">
      <SettingsPageHeader
        title="Connections & MCP"
        description="AI tools connected to your memory, and knowledge bases synced into your stash."
      />

      <ConnectedAppsSection />

      <DefaultCollectionSection />

      {error && (
        <p className="mb-4 max-w-2xl rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="max-w-2xl space-y-4">
        <article className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <NotionLogo />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">Notion</h2>
                  {status && StatusIcon && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                        status.badge
                      )}
                    >
                      <StatusIcon className={cn("size-3", status.iconCls)} />
                      {status.label}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {notion
                    ? notion.workspace_name || "Notion workspace"
                    : "Sync pages and databases into collections in your stash."}
                </p>

                {notion && (
                  <p className="mt-2 text-xs text-slate-400">
                    Last synced {relativeTime(notion.last_sync_at)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              {loading ? (
                <Loader2 className="size-4 animate-spin text-slate-400" />
              ) : notion ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg border-slate-200 bg-white text-slate-700 shadow-none"
                    onClick={() => syncNow(notion.id)}
                    disabled={notion.status === "syncing"}
                  >
                    <RefreshCw
                      className={cn(
                        "size-3.5",
                        notion.status === "syncing" && "animate-spin"
                      )}
                    />
                    Sync now
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => disconnect(notion)}
                  >
                    <Trash2 className="size-3.5" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="h-8 rounded-lg px-4"
                  onClick={connectNotion}
                  disabled={connecting}
                >
                  {connecting ? "Connecting…" : "Connect Notion"}
                </Button>
              )}
            </div>
          </div>

          {notion?.status === "error" && notion.last_error && (
            <div className="border-t border-slate-100 bg-amber-50/80 px-5 py-3">
              <p className="text-xs leading-relaxed text-amber-800">
                {notion.last_error}
              </p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
