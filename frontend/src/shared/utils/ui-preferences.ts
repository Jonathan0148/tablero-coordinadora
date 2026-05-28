const VISIBLE_STATUSES_KEY = "cit-v3-visible-statuses";

export function loadVisiblePipelineStatuses(fallback: string[]): string[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(VISIBLE_STATUSES_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.every((v) => typeof v === "string") ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveVisiblePipelineStatuses(statuses: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VISIBLE_STATUSES_KEY, JSON.stringify(statuses));
}

const SHOWN_REMINDERS_KEY = "cit-v3-shown-rem";

export function loadShownReminders(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SHOWN_REMINDERS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === "number") : []);
  } catch {
    return new Set();
  }
}

export function saveShownReminders(ids: Set<number>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHOWN_REMINDERS_KEY, JSON.stringify([...ids]));
}
