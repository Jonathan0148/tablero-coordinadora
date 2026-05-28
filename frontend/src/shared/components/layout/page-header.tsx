import { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-app-muted">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-xl font-bold tracking-tight text-app-fg sm:text-2xl lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-3xl text-sm text-app-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">{actions}</div>}
    </div>
  );
}
