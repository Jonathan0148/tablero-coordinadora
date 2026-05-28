"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { logService } from "@/services/project.service";
import { useConfirm } from "@/providers/confirm-provider";
import { useToast } from "@/providers/toast-provider";
import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { Timeline, TimelineItem } from "@/shared/components/data/timeline";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { ErrorState } from "@/shared/components/state";
import { KANBAN_AREAS, LOG_AREAS } from "@/shared/utils/constants";
import { exportLogsToTxt } from "@/shared/utils/export-log";
import { fmtDate, fmtDateTime } from "@/shared/utils/format";
import type { ActivityLog } from "@/types/domain";

function areaLabel(code: string) {
  return KANBAN_AREAS.find((a) => a.code === code)?.label ?? code;
}

export function LogView() {
  const [text, setText] = useState("");
  const [areaCode, setAreaCode] = useState("COTIDIANA");
  const [areaFilter, setAreaFilter] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { confirm: confirmDialog } = useConfirm();

  const query = useQuery({
    queryKey: ["activity-logs", areaFilter],
    queryFn: () => logService.list(0, 500, areaFilter || undefined),
  });

  const filtered = useMemo(() => {
    const logs = query.data?.content ?? [];
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter((l) => l.text.toLowerCase().includes(q));
  }, [query.data, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, ActivityLog[]> = {};
    filtered.forEach((log) => {
      const key = log.loggedAtOriginal.split("T")[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const createMutation = useMutation({
    mutationFn: () => logService.create({ text, areaCode }),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-executive"] });
      showToast("Actividad registrada", "success");
    },
    onError: (e: Error) => showToast(e.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => logService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activity-logs"] }),
  });

  if (query.isLoading) return <PageSkeleton />;
  if (query.isError) return <ErrorState message={query.error.message} />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Bitácora"
        title="Registro operativo append-only"
        subtitle="Entradas cronológicas con categoría, búsqueda y exportación TXT."
        actions={
          <Button variant="secondary" onClick={() => { exportLogsToTxt(filtered); showToast("Bitácora exportada", "success"); }}>
            <Download className="mr-2 h-4 w-4" /> Exportar TXT
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-3 pt-5">
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
            rows={4}
            placeholder="Describe la actividad realizada..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <select className="h-9 rounded-xl border border-slate-200 px-3 text-sm" value={areaCode} onChange={(e) => setAreaCode(e.target.value)}>
              {LOG_AREAS.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
            </select>
            <Button disabled={!text.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>Registrar entrada</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 w-full flex-1 basis-[min(100%,12rem)]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en bitácora..."
            className="h-9 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm"
          />
        </div>
        <select className="h-9 rounded-xl border border-slate-200 px-3 text-sm" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
          <option value="">Todas las áreas</option>
          {LOG_AREAS.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-5">
          {!grouped.length ? (
            <p className="text-sm text-slate-500">Sin registros.</p>
          ) : (
            grouped.map(([date, logs]) => (
              <div key={date} className="mb-8 last:mb-0">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">{fmtDate(date)}</p>
                <Timeline>
                  {logs.map((log, i) => (
                    <TimelineItem
                      key={log.id}
                      title={fmtDateTime(log.loggedAtOriginal).split(" ")[1] ?? ""}
                      badges={<Badge tone="blue">{areaLabel(log.areaCode)}</Badge>}
                      isLast={i === logs.length - 1}
                    >
                      <p className="whitespace-pre-wrap">{log.text}</p>
                      <button
                        type="button"
                        className="mt-2 text-xs text-red-500 hover:underline"
                        onClick={async () => {
                          const ok = await confirmDialog({
                            title: "Eliminar entrada",
                            description: "¿Eliminar esta entrada de la bitácora?",
                            confirmLabel: "Eliminar",
                            variant: "danger",
                          });
                          if (ok) deleteMutation.mutate(log.id);
                        }}
                      >
                        Eliminar
                      </button>
                    </TimelineItem>
                  ))}
                </Timeline>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
