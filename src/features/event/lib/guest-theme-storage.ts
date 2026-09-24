import type { GuestThemeConfig } from "../components/guest-theme/guest-theme-types";
import { DEFAULT_GUEST_THEME_CONFIG } from "../components/guest-theme/guest-theme-types";

const STORAGE_KEY_PREFIX = "cc_guest_theme_";

export function generateDefaultMonogram(name: string): string {
  if (!name || !name.trim()) return "";

  const cleaned = name.trim();

  // If contains "&" or "and" or "và"
  if (cleaned.includes("&")) {
    const parts = cleaned.split("&").map((p) => p.trim());

    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0].charAt(0).toUpperCase()} & ${parts[1].charAt(0).toUpperCase()}`;
    }
  }

  const andMatch = cleaned.match(/^(.+?)\s+(?:and|và|\+)\s+(.+)$/i);

  if (andMatch && andMatch[1] && andMatch[2]) {
    return `${andMatch[1].trim().charAt(0).toUpperCase()} & ${andMatch[2].trim().charAt(0).toUpperCase()}`;
  }

  // Otherwise take first letters of up to two words
  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length >= 2 && words[0] && words[1]) {
    return `${words[0].charAt(0).toUpperCase()}${words[1].charAt(0).toUpperCase()}`;
  }

  return cleaned.slice(0, 2).toUpperCase();
}

export function saveGuestThemeConfig(
  eventId: string,
  config: GuestThemeConfig,
): void {
  if (typeof window === "undefined") return;

  try {
    const key = `${STORAGE_KEY_PREFIX}${eventId}`;

    localStorage.setItem(key, JSON.stringify(config));
  } catch {
    // Gracefully handle storage quota or private browsing mode
  }
}

export function loadGuestThemeConfig(eventId: string): GuestThemeConfig | null {
  if (typeof window === "undefined") return null;

  try {
    const key = `${STORAGE_KEY_PREFIX}${eventId}`;
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<GuestThemeConfig>;

    return {
      ...DEFAULT_GUEST_THEME_CONFIG,
      ...parsed,
    };
  } catch {
    return null;
  }
}

export function clearGuestThemeConfig(eventId: string): void {
  if (typeof window === "undefined") return;

  try {
    const key = `${STORAGE_KEY_PREFIX}${eventId}`;

    localStorage.removeItem(key);
  } catch {
    // Ignore error
  }
}
