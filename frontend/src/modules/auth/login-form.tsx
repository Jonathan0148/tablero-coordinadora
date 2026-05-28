"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthStore } from "@/modules/auth/auth-store";
import { EnterpriseApiError } from "@/services/api-client";
import { Button } from "@/shared/components/button";

const schema = z.object({
  username: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "admin", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setError(null);
    try {
      await login(values.username, values.password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof EnterpriseApiError ? err.userMessage : "No fue posible iniciar sesión");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Usuario</label>
        <input
          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
          {...form.register("username")}
        />
        <p className="mt-1 text-xs text-red-600">{form.formState.errors.username?.message}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Contraseña</label>
        <input
          type="password"
          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
          {...form.register("password")}
        />
        <p className="mt-1 text-xs text-red-600">{form.formState.errors.password?.message}</p>
      </div>
      {error ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Validando..." : "Ingresar"}
      </Button>
    </form>
  );
}
