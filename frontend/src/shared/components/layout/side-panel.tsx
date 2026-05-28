"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type SidePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg" | "xl";
};

const widths = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function SidePanel({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  footer,
  width = "lg",
}: SidePanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="settings-backdrop fixed inset-0 z-[70] bg-black/35 backdrop-blur-[3px]" />
        <Dialog.Content
          className={cn(
            "settings-panel fixed inset-y-0 right-0 z-[71] flex w-full flex-col",
            "bg-app-surface shadow-[var(--app-shadow-lg)] outline-none",
            widths[width],
          )}
        >
          <div className="flex items-start justify-between border-b border-app-border/40 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              {icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-app bg-app-accent/10 text-app-accent">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <Dialog.Title className="truncate text-base font-semibold text-app-fg">{title}</Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-0.5 text-xs text-app-muted">{description}</Dialog.Description>
                )}
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Cerrar panel"
                className="rounded-lg p-2 text-app-muted transition hover:bg-app-hover hover:text-app-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-app-border/40 px-5 py-4">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
