"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { AppBrand } from "@/shared/components/layout/sidebar-brand";
import { SidebarNav } from "@/shared/components/layout/app-sidebar";
import { cn } from "@/shared/utils/cn";

type MobileNavDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasPermission: (permission: string) => boolean;
};

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Abrir menú de navegación"
      onClick={onClick}
      className="rounded-app p-2 text-app-muted transition hover:bg-app-hover hover:text-app-fg lg:hidden"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function MobileNavDrawer({ open, onOpenChange, hasPermission }: MobileNavDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="settings-backdrop fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] lg:hidden" />
        <Dialog.Content
          className={cn(
            "mobile-nav-panel fixed inset-y-0 left-0 z-[61] flex w-[min(100vw-3rem,18rem)] flex-col",
            "bg-app-sidebar shadow-[var(--app-shadow-lg)] outline-none lg:hidden",
          )}
        >
          <div className="flex items-center justify-between px-3 py-3">
            <AppBrand />
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Cerrar menú"
                className="rounded-app p-2 text-app-muted transition hover:bg-app-hover hover:text-app-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-6">
            <SidebarNav
              expanded
              hasPermission={hasPermission}
              onNavigate={() => onOpenChange(false)}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
