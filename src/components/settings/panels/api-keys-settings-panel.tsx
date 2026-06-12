"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Button } from "@/components/ui/button";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  type ApiKey,
  type CreatedApiKey,
} from "@/lib/api/apikeys";

const MCP_URL =
  process.env.NEXT_PUBLIC_HOLOCRON_MCP_URL ?? "https://holocron.openstash.xyz/mcp";

const cardClass =
  "rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

function relativeTime(iso?: string | null) {
  if (!iso) return "never used";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function ApiKeysSettingsPanel() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [fresh, setFresh] = useState<CreatedApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setKeys(await listApiKeys());
    } catch {
      toast.error("Couldn't load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create() {
    setCreating(true);
    try {
      const name = window.prompt("Name this key (e.g. 'Claude Desktop')") ?? "";
      const created = await createApiKey(name.trim() || "Untitled");
      setFresh(created);
      setCopied(false);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create key");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    if (!window.confirm("Revoke this key? Tools using it will lose access immediately."))
      return;
    await revokeApiKey(id).catch(() => toast.error("Couldn't revoke key"));
    if (fresh?.id === id) setFresh(null);
    refresh();
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const mcpSnippet = JSON.stringify(
    {
      mcpServers: {
        "openstash-memory": {
          url: MCP_URL,
          headers: { Authorization: `Bearer ${fresh?.key ?? "osk_YOUR_KEY"}` },
        },
      },
    },
    null,
    2,
  );

  return (
    <div className="flex flex-1 flex-col p-8">
      <SettingsPageHeader
        title="Memory API keys"
        description="Connect Claude, ChatGPT, or Cursor to your shared memory via MCP. Create a key, paste it into the tool's MCP config, and it can save & recall memories across all of them."
      />

      <div className="max-w-2xl space-y-4">
        {/* Freshly-created key — shown once */}
        {fresh && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              Key created — copy it now, it won&apos;t be shown again.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-sm text-slate-800">
                {fresh.key}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 shrink-0"
                onClick={() => copy(fresh.key)}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <p className="mt-4 text-xs font-medium text-slate-600">
              Paste this into your tool&apos;s MCP config (Claude Desktop / Cursor):
            </p>
            <pre className="mt-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
              {mcpSnippet}
            </pre>
          </div>
        )}

        {/* Create */}
        <div className={`${cardClass} flex items-center justify-between p-5`}>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <KeyRound className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Create a memory key</p>
              <p className="text-xs text-slate-500">One key per tool you connect.</p>
            </div>
          </div>
          <Button type="button" size="sm" onClick={create} disabled={creating}>
            {creating ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            New key
          </Button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {loading ? (
            <Loader2 className="size-4 animate-spin text-slate-400" />
          ) : keys.length === 0 ? (
            <p className="px-1 text-sm text-slate-400">No keys yet.</p>
          ) : (
            keys.map((k) => (
              <div
                key={k.id}
                className={`${cardClass} flex items-center justify-between gap-3 p-4`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {k.name || "Untitled"}
                  </p>
                  <p className="font-mono text-xs text-slate-400">
                    {k.prefix}…&nbsp;·&nbsp;{relativeTime(k.last_used_at)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => revoke(k.id)}
                >
                  <Trash2 className="size-3.5" />
                  Revoke
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
