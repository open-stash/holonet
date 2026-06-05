import { z } from "zod";

/** kyber requires a scheme — prepend https:// when the user omits it. */
export function normalizeStashUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function parseHttpUrl(raw: string): URL | null {
  try {
    const url = new URL(normalizeStashUrl(raw));
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname) return null;
    return url;
  } catch {
    return null;
  }
}

export function isValidStashUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  return parseHttpUrl(trimmed) !== null;
}

export function getStashUrlError(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (/\s/.test(trimmed)) return "URL cannot contain spaces";
  if (!parseHttpUrl(trimmed)) {
    return "Enter a valid URL (e.g. https://example.com)";
  }
  return undefined;
}

export const stashUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine((value) => !/\s/.test(value), "URL cannot contain spaces")
  .refine(isValidStashUrl, "Enter a valid URL (e.g. https://example.com)");
