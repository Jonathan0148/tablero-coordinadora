"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthStore } from "@/modules/auth/auth-store";
import { EnterpriseApiError } from "@/services/api-client";
import { Button } from "@/shared/components/button";
import { PasswordInput } from "@/shared/components/password-input";
import { cn } from "@/shared/utils/cn";

const schema = z.object({
  email: z.string().min(1, "El email es obligatorio").email("Ingresa un email válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginValues = z.infer<typeof schema>;

const inputClass =
  "h-11 w-full rounded-app bg-app-input py-2 pl-10 pr-3 text-sm text-app-fg outline-none transition duration-200 placeholder:text-app-muted/70 focus:bg-app-surface focus:ring-2 focus:ring-app-accent/25";

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@local.dev", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setError(null);
    try {
      await login(values.email, values.password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof EnterpriseApiError ? err.userMessage : "No fue posible iniciar sesión");
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wide text-app-muted">
          Correo corporativo
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="nombre@empresa.com"
            className={inputClass}
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wide text-app-muted">
          Contraseña
        </label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-app border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        className={cn(
          "h-11 w-full text-sm font-semibold shadow-lg transition duration-200",
          "hover:shadow-xl disabled:opacity-70",
        )}
        disabled={submitting}
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Validando acceso...
          </span>
        ) : (
          "Ingresar a la plataforma"
        )}
      </Button>
    </form>
  );
}
