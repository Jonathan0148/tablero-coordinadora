import { KANBAN_AREAS } from "@/shared/utils/constants";
import type { ActivityLog } from "@/types/domain";

function areaLabel(code: string): string {
  return KANBAN_AREAS.find((a) => a.code === code)?.label ?? code;
}

export function exportLogsToTxt(logs: ActivityLog[]): void {
  const lines = logs.map((l) => {
    const d = l.loggedAtOriginal.split("T")[0];
    const t = l.loggedAtOriginal.split("T")[1]?.slice(0, 5) ?? "";
    return `[${d} ${t}] [${areaLabel(l.areaCode)}] ${l.text}`;
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bitacora_${new Date().toISOString().split("T")[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
