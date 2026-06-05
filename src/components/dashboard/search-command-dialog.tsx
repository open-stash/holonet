"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  FolderOpen,
  Link2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  useCollectionsStore,
  useSearchStore,
  useSourcesStore,
} from "@source/stores";

const itemClassName =
  "gap-3 rounded-xl px-2.5 py-2.5 aria-selected:bg-slate-100 data-[selected=true]:bg-slate-100 [&>svg:last-child]:hidden";

const iconBoxClassName =
  "flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-600 [&_svg]:size-4";

function sourceIcon(type: string): LucideIcon {
  switch (type) {
    case "link":
      return Link2;
    default:
      return FileText;
  }
}

function displayTitle(title: string, url?: string) {
  if (title.trim()) return title;
  if (url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
  return "Untitled";
}

function truncateMiddle(text: string, max = 44) {
  if (text.length <= max) return text;
  const keep = Math.floor((max - 1) / 2);
  return `${text.slice(0, keep)}…${text.slice(-keep)}`;
}

function ResultIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className={iconBoxClassName} aria-hidden>
      <Icon />
    </span>
  );
}

function ResultCopy({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug">
      <span className="truncate text-sm font-medium text-slate-900">
        {title}
      </span>
      <span className="truncate text-xs text-slate-500">{subtitle}</span>
    </div>
  );
}

export function SearchCommandDialog() {
  const router = useRouter();
  const open = useSearchStore((state) => state.open);
  const setOpen = useSearchStore((state) => state.setOpen);
  const toggle = useSearchStore((state) => state.toggle);
  const collections = useCollectionsStore((state) => state.collections);
  const items = useSourcesStore((state) => state.items);
  const sources = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [items]
  );

  const collectionById = useMemo(
    () => new Map(collections.map((c) => [c.id, c.name])),
    [collections]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key !== " " && event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search your stash"
      className={cn(
        "top-[12%] gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-none sm:max-w-lg",
        "[&_[data-slot=command-input-wrapper]]:px-3 [&_[data-slot=command-input-wrapper]]:pt-3 [&_[data-slot=command-input-wrapper]]:pb-2",
        "[&_[data-slot=input-group]]:h-11 [&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:border-slate-200/80 [&_[data-slot=input-group]]:bg-slate-50 [&_[data-slot=input-group]]:shadow-none",
        "[&_[data-slot=command-input]]:h-11 [&_[data-slot=command-input]]:px-3 [&_[data-slot=command-input]]:text-sm",
        "[&_[data-slot=command-list]]:max-h-[min(52vh,24rem)] [&_[data-slot=command-list]]:px-2 [&_[data-slot=command-list]]:pb-3",
        "[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-slate-400",
        "[&_[data-slot=command-group]]:p-0.5",
        "[&_[data-slot=command-separator]]:my-2 [&_[data-slot=command-separator]]:mx-3 [&_[data-slot=command-separator]]:bg-slate-100"
      )}
    >
      <Command className="rounded-2xl bg-transparent">
        <CommandInput
          placeholder="Search links, notes, collections…"
          className="h-11 border-0 bg-transparent shadow-none placeholder:text-slate-400"
        />

        <CommandList>
          <CommandEmpty className="py-12 text-sm text-slate-500">
            No results found.
          </CommandEmpty>

          <CommandGroup heading="Sources">
            {sources.map((source) => {
              const Icon = sourceIcon(source.type);
              const collectionName =
                collectionById.get(source.collection_id) ?? "Collection";
              const title = displayTitle(source.title, source.original_url);
              const subtitle =
                source.type === "link" && source.original_url
                  ? truncateMiddle(source.original_url)
                  : collectionName;

              return (
                <CommandItem
                  key={source.id}
                  value={`${title} ${subtitle} ${source.type}`}
                  className={itemClassName}
                  onSelect={() =>
                    go(`/dashboard/collections/${source.collection_id}`)
                  }
                >
                  <ResultIcon icon={Icon} />
                  <ResultCopy title={title} subtitle={subtitle} />
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Collections">
            {collections.map((collection) => (
              <CommandItem
                key={collection.id}
                value={collection.name}
                className={itemClassName}
                onSelect={() => go(`/dashboard/collections/${collection.id}`)}
              >
                <ResultIcon icon={FolderOpen} />
                <ResultCopy
                  title={collection.name}
                  subtitle={`${collection.item_count} items`}
                />
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Go to">
            <CommandItem
              value="ai chat home"
              className={itemClassName}
              onSelect={() => go("/dashboard")}
            >
              <ResultIcon icon={Sparkles} />
              <ResultCopy title="AI Chat" subtitle="Home" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
