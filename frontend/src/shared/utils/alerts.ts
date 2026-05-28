import type { AlertItem } from "@/types/domain";

export type AlertGroup = {
  id: string;
  label: string;
  priority: number;
  items: AlertItem[];
};

const TYPE_PRIORITY: Record<string, number> = {
  coord: 1,
  blocked: 2,
  stopper: 3,
  milestone: 4,
  stale: 5,
  overdue: 6,
  today: 7,
  reminder: 8,
};

const TYPE_LABELS: Record<string, string> = {
  coord: "Coordinación",
  blocked: "Bloqueados",
  stopper: "Stoppers",
  milestone: "Hitos vencidos",
  stale: "Sin actualizar",
  overdue: "Actividades vencidas",
  today: "Vencen hoy",
  reminder: "Recordatorios",
};

export function groupAlerts(alerts: AlertItem[]): AlertGroup[] {
  const map = new Map<string, AlertItem[]>();
  alerts.forEach((a) => {
    const key = a.type;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  });
  return Array.from(map.entries())
    .map(([type, items]) => ({
      id: type,
      label: TYPE_LABELS[type] ?? type,
      priority: TYPE_PRIORITY[type] ?? 99,
      items,
    }))
    .sort((a, b) => a.priority - b.priority);
}

export function alertTone(type: string): "red" | "yellow" | "blue" | "slate" {
  if (["coord", "blocked", "stopper", "overdue"].includes(type)) return "red";
  if (["milestone", "stale", "today"].includes(type)) return "yellow";
  if (type === "reminder") return "blue";
  return "slate";
}
