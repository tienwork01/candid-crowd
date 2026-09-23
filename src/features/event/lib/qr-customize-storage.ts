import type { QRCustomizeState } from "../components/qr-customize/qr-customize-types";
import { DEFAULT_QR_CUSTOMIZE_STATE } from "../components/qr-customize/qr-customize-types";

const STORAGE_KEY_PREFIX = "cc_qr_config_";

export function saveQRConfig(eventId: string, config: QRCustomizeState): void {
  if (typeof window === "undefined") return;

  try {
    const key = `${STORAGE_KEY_PREFIX}${eventId}`;

    localStorage.setItem(key, JSON.stringify(config));
  } catch {
    // Gracefully handle storage quota or privacy mode errors
  }
}

export function loadQRConfig(eventId: string): QRCustomizeState | null {
  if (typeof window === "undefined") return null;

  try {
    const key = `${STORAGE_KEY_PREFIX}${eventId}`;
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<QRCustomizeState>;

    return {
      ...DEFAULT_QR_CUSTOMIZE_STATE,
      ...parsed,
    };
  } catch {
    return null;
  }
}

export function clearQRConfig(eventId: string): void {
  if (typeof window === "undefined") return;

  try {
    const key = `${STORAGE_KEY_PREFIX}${eventId}`;

    localStorage.removeItem(key);
  } catch {
    // Ignore error
  }
}
