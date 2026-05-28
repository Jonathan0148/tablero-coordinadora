const SIDEBAR_COLLAPSED_KEY = "cit-sidebar-collapsed";

const sidebarListeners = new Set<() => void>();

function notifySidebarListeners() {
  sidebarListeners.forEach((listener) => listener());
}

export function subscribeSidebarCollapsed(onStoreChange: () => void) {
  sidebarListeners.add(onStoreChange);
  return () => sidebarListeners.delete(onStoreChange);
}

export function loadSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

export function saveSidebarCollapsed(collapsed: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  notifySidebarListeners();
}

export function getSidebarCollapsedSnapshot(): boolean {
  return loadSidebarCollapsed();
}

export function getSidebarCollapsedServerSnapshot(): boolean {
  return false;
}

export const SIDEBAR_WIDTH_EXPANDED = "16rem";
export const SIDEBAR_WIDTH_COLLAPSED = "4.5rem";
