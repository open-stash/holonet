import {
  FileText,
  FileType2,
  Link2,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import type { Source, SourceType } from "@/types/kyber";

export const SOURCE_TYPE_ORDER: SourceType[] = [
  "link",
  "note",
  "pdf",
  "ppt",
  "doc",
];

export const typeLabel: Record<SourceType, string> = {
  link: "Link",
  note: "Note",
  pdf: "PDF",
  ppt: "Slides",
  doc: "Doc",
};

export const typeIcon: Record<SourceType, LucideIcon> = {
  link: Link2,
  note: FileText,
  pdf: FileText,
  ppt: Presentation,
  doc: FileType2,
};

export function sourceTitle(source: Source) {
  if (source.title.trim()) return source.title;

  if (source.original_url) {
    try {
      return new URL(source.original_url).hostname;
    } catch {
      return source.original_url;
    }
  }

  return "Untitled";
}

export function sourceDomain(source: Source) {
  if (!source.original_url) return null;
  try {
    return new URL(source.original_url).hostname.replace(/^www\./, "");
  } catch {
    return source.original_url;
  }
}

export function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}

// Decorative page/slide counts for document cards when the API doesn't return metadata yet.
export function estimatedPageCount(source: Source) {
  let hash = 0;
  for (const char of source.id) hash += char.charCodeAt(0);
  return 24 + (hash % 180);
}

export function estimatedSlideCount(source: Source) {
  let hash = 0;
  for (const char of source.id) hash += char.charCodeAt(0);
  return 6 + (hash % 28);
}

export function sourceSubtitle(source: Source) {
  if (source.type === "link" && source.original_url) {
    return source.original_url;
  }

  return typeLabel[source.type];
}

export function groupSourcesByType(sources: Source[]) {
  const groups = new Map<SourceType, Source[]>();

  for (const type of SOURCE_TYPE_ORDER) {
    groups.set(type, []);
  }

  for (const source of sources) {
    groups.get(source.type)?.push(source);
  }

  return SOURCE_TYPE_ORDER.flatMap((type) => {
    const items = groups.get(type) ?? [];
    if (!items.length) return [];
    return [{ type, items }];
  });
}
