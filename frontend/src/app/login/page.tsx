import Image from "next/image";
import { LoginForm } from "@/modules/auth/login-form";
import { Card, CardContent } from "@/shared/components/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#e0f2fe,transparent_35%),#f8fafc] p-6">
      <Card className="w-full max-w-md border-slate-200/80 shadow-xl shadow-slate-200/50">
        <CardContent className="space-y-8 p-8">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/logo.png"
              alt="Coltefinanciera"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
              priority
            />
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">IT Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Gestión ejecutiva de proyectos y operaciones IT</p>
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
