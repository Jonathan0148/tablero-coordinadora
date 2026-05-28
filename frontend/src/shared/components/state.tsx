import { AlertCircle, Loader2 } from "lucide-react";

export function LoadingState({ label = "Cargando información real..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4" />
      <div>
        <p className="font-semibold">No fue posible cargar la información</p>
        <p className="mt-1">{message}</p>
      </div>
    </div>
  );
}
