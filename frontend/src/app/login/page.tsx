import { LoginBrand } from "@/modules/auth/login-brand";
import { LoginForm } from "@/modules/auth/login-form";
import { Card, CardContent } from "@/shared/components/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--app-accent)_12%,transparent),transparent_40%)]" />
      <Card className="relative w-full max-w-md border-app-border shadow-[var(--app-shadow-lg)]">
        <CardContent className="space-y-8 p-8">
          <div className="flex flex-col items-center text-center">
            <LoginBrand />
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-app-fg">IT Dashboard</h1>
            <p className="mt-1 text-sm text-app-muted">Gestión ejecutiva de proyectos y operaciones IT</p>
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
