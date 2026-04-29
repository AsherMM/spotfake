import type { NotifyMode } from "../modes/config";

export const NOTIFY_STORAGE_KEY = "spotfake:notify";

type Stored = { modes?: string[]; email?: string };

export function readNotifySubscribed(mode: NotifyMode): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(NOTIFY_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Stored;
    return Array.isArray(parsed.modes) && parsed.modes.includes(mode);
  } catch {
    return false;
  }
}

export function persistNotifySubscribed(mode: NotifyMode, email: string) {
  try {
    const raw = localStorage.getItem(NOTIFY_STORAGE_KEY);
    const parsed: Stored = raw ? (JSON.parse(raw) as Stored) : {};
    const modes = new Set(parsed.modes ?? []);
    modes.add(mode);
    localStorage.setItem(
      NOTIFY_STORAGE_KEY,
      JSON.stringify({ modes: Array.from(modes), email })
    );
  } catch {
    // ignore — storage may be unavailable (private mode, quota, etc.)
  }
}