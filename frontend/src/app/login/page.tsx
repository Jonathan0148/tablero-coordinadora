import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/modules/auth/login-form";
import { Card, CardContent } from "@/shared/components/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#e0f2fe,transparent_35%),#f8fafc] p-6">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Acceso seguro</p>
              <h1 className="text-2xl font-bold text-slate-950">IT Dashboard</h1>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            Autenticación real contra Spring Security, JWT y RBAC almacenado en Oracle.
          </p>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
