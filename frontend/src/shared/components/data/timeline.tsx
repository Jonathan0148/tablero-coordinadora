import { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export function Timeline({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative space-y-0", className)}>{children}</div>;
}

export function TimelineItem({
  title,
  meta,
  badges,
  children,
  isLast,
}: {
  title: string;
  meta?: string;
  badges?: ReactNode;
  children?: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-4 pb-6">
      <div className="flex flex-col items-center">
        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-slate-300 bg-white ring-4 ring-slate-50" />
        {!isLast && <div className="mt-1 w-px flex-1 bg-slate-200" />}
      </div>
      <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            {meta && <p className="mt-0.5 text-xs text-slate-400">{meta}</p>}
          </div>
          {badges && <div className="flex flex-wrap gap-1.5">{badges}</div>}
        </div>
        {children && <div className="mt-3 space-y-2 text-sm text-slate-600">{children}</div>}
      </div>
    </div>
  );
}
