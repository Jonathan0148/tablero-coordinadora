"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/shared/components/button";
import { cn } from "@/shared/utils/cn";

export type ConfirmVariant = "danger" | "warning" | "info" | "success";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
};

type ConfirmRequest = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const VARIANT_STYLES: Record<
  ConfirmVariant,
  { icon: typeof AlertTriangle; iconWrap: string; iconColor: string; button: "primary" | "danger" }
> = {
  danger: { icon: AlertTriangle, iconWrap: "bg-red-100", iconColor: "text-red-600", button: "danger" },
  warning: { icon: AlertCircle, iconWrap: "bg-amber-100", iconColor: "text-amber-600", button: "primary" },
  info: { icon: Info, iconWrap: "bg-blue-100", iconColor: "text-blue-600", button: "primary" },
  success: { icon: CheckCircle2, iconWrap: "bg-emerald-100", iconColor: "text-emerald-600", button: "primary" },
};

function ConfirmDialogUI({
  request,
  onClose,
}: {
  request: ConfirmRequest;
  onClose: (result: boolean) => void;
}) {
  const variant = request.variant ?? "danger";
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;

  return (
    <AlertDialog.Root open onOpenChange={(open) => !open && onClose(false)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]" />
        <AlertDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-none",
            "animate-in fade-in-0 zoom-in-95 duration-200",
          )}
        >
          <div className="flex gap-4">
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", styles.iconWrap)}>
              <Icon className={cn("h-5 w-5", styles.iconColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <AlertDialog.Title className="text-base font-semibold text-slate-900">
                {request.title}
              </AlertDialog.Title>
              {request.description && (
                <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-slate-600">
                  {request.description}
                </AlertDialog.Description>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button type="button" variant="secondary" onClick={() => onClose(false)}>
                {request.cancelLabel ?? "Cancelar"}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button type="button" variant={styles.button} onClick={() => onClose(true)}>
                {request.confirmLabel ?? "Confirmar"}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setRequest({ ...options, resolve });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    setRequest((current) => {
      current?.resolve(result);
      return null;
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {request && <ConfirmDialogUI request={request} onClose={handleClose} />}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
