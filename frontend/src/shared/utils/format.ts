export function fmtDate(value?: string | null): string {
  if (!value) return "";
  const datePart = value.split("T")[0];
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y}`;
}

export function fmtDateTime(value?: string | null): string {
  if (!value) return "";
  const [datePart, timePart] = value.split("T");
  const time = timePart?.slice(0, 5) ?? "";
  return `${fmtDate(datePart)} ${time}`.trim();
}

export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

export function dueSeverity(dueDate?: string, statusCode?: string): "overdue" | "today" | null {
  if (!dueDate || statusCode === "HECHO") return null;
  const today = todayIso();
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return null;
}
