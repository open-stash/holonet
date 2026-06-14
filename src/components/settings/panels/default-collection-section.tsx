"use client";

// Where the browser extension saves pages. The extension sends no collection;
// kyber routes the save into whatever's chosen here.

import { useCallback, useEffect, useState } from "react";
import { FolderDown, Loader2 } from "lucide-react";
import { getCollections, getDefaultCollection, setDefaultCollection } from "@/lib/api/kyber";
import type { Collection } from "@/types/kyber";

export function DefaultCollectionSection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [cols, def] = await Promise.all([getCollections(), getDefaultCollection()]);
      const active = cols.filter((c) => !c.deleted_at);
      setCollections(active);
      setSelected(def?.id ?? "");
      setError(null);
    } catch {
      setError("Couldn't load collections.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onChange(id: string) {
    if (!id || id === selected) return;
    setSelected(id);
    setSaving(true);
    setSaved(false);
    try {
      await setDefaultCollection(id);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      setError("Couldn't update the default collection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-8 max-w-2xl">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <FolderDown className="size-4 text-muted-foreground" />
        Default collection for the browser extension
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pages you save from the OpenStash browser extension land here.
      </p>

      <div className="mt-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : collections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create a collection first, then pick it here.
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <select
              value={selected}
              onChange={(e) => onChange(e.target.value)}
              disabled={saving}
              className="h-9 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="" disabled>
                Choose a collection…
              </option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {saving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            {saved && <span className="text-xs font-medium text-emerald-600">Saved</span>}
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </section>
  );
}
