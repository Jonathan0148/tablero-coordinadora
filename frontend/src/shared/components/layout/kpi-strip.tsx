import { cn } from "@/shared/utils/cn";

export type KpiItem = {
  label: string;
  value: number;
  tone?: "slate" | "red" | "amber" | "green";
  barPct?: number;
};

const toneStyles = {
  slate: { value: "text-slate-900", bar: "bg-slate-400", ring: "border-slate-200" },
  red: { value: "text-red-600", bar: "bg-red-500", ring: "border-red-100" },
  amber: { value: "text-amber-600", bar: "bg-amber-500", ring: "border-amber-100" },
  green: { value: "text-emerald-600", bar: "bg-emerald-500", ring: "border-emerald-100" },
};

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const t = toneStyles[item.tone ?? "slate"];
        return (
          <div
            key={item.label}
            className={cn("rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md", t.ring)}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className={cn("mt-1 font-mono text-3xl font-bold tabular-nums", t.value)}>{item.value}</p>
            {item.barPct !== undefined && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className={cn("h-full rounded-full transition-all duration-500", t.bar)} style={{ width: `${Math.min(100, item.barPct)}%` }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
