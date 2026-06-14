"use client";

// Outbound view: AI apps the user has connected TO their OpenStash memory over MCP
// (ChatGPT/Claude via OAuth). API-key clients (Claude Code/Cursor) live under Memory API keys.

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Boxes, Copy, Loader2, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listConnectedApps,
  disconnectApp,
  type ConnectedApp,
} from "@/lib/api/connections";

const MCP_URL =
  process.env.NEXT_PUBLIC_HOLOCRON_MCP_URL ?? "https://chat.openstash.xyz/mcp";

function appLogo(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("chatgpt") || n.includes("openai")) return "/connectors/chatgpt.png";
  if (n.includes("claude")) return "/connectors/claude.png";
  return null;
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function ConnectedAppsSection() {
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setApps(await listConnectedApps());
      setError(null);
    } catch {
      setError("Couldn't load connected apps.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onDisconnect(app: ConnectedApp) {
    if (!window.confirm(`Disconnect ${app.name}? Its access ends within an hour.`)) return;
    setBusy(app.client_id);
    try {
      await disconnectApp(app.client_id);
      await refresh();
    } catch {
      setError("Couldn't disconnect that app.");
    } finally {
      setBusy(null);
    }
  }

  function copyUrl() {
    navigator.clipboard?.writeText(MCP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <section className="mb-8 max-w-2xl">
      <h2 className="text-sm font-semibold text-foreground">Apps connected to your memory</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        AI tools connected to OpenStash over MCP — they can recall and save your memory.
      </p>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2">
        <code className="flex-1 truncate text-xs text-foreground">{MCP_URL}</code>
        <button
          type="button"
          onClick={copyUrl}
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Copy className="size-3.5" /> {copied ? "Copied" : "Copy MCP URL"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-3 space-y-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : apps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-muted-foreground">
            No apps connected yet. Add OpenStash as a connector in ChatGPT or Claude using
            the MCP URL above.
          </div>
        ) : (
          apps.map((app) => (
            <div
              key={app.client_id}
              className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                {appLogo(app.name) ? (
                  <Image
                    src={appLogo(app.name) as string}
                    alt={app.name}
                    width={36}
                    height={36}
                    draggable={false}
                    className="pointer-events-none size-6 rounded object-contain"
                  />
                ) : (
                  <Boxes className="size-4 text-foreground/70" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{app.name}</div>
                <div className="text-xs text-muted-foreground">
                  Connected {fmtDate(app.connected_at)}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={busy === app.client_id}
                onClick={() => onDisconnect(app)}
                className="gap-1.5 text-xs"
              >
                {busy === app.client_id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Unplug className="size-3.5" />
                )}
                Disconnect
              </Button>
            </div>
          ))
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Claude Code & Cursor connect with an API key — manage those under{" "}
        <a href="/settings/api-keys" className="underline hover:text-foreground">
          Memory API keys
        </a>
        .
      </p>
    </section>
  );
}
