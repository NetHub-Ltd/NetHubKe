/**
 * Client-side console preferences (N9).
 * Stored in localStorage until a server preferences API exists.
 */

export type ConsolePreferences = {
  notificationsEmail: boolean;
  notificationsProduct: boolean;
  launchHopEnabled: boolean;
  sharedDeviceMode: boolean;
};

const STORAGE_KEY = "nethub.console.preferences";

export const DEFAULT_PREFERENCES: ConsolePreferences = {
  notificationsEmail: true,
  notificationsProduct: true,
  launchHopEnabled: false,
  sharedDeviceMode: false,
};

export function loadPreferences(): ConsolePreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<ConsolePreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: ConsolePreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
