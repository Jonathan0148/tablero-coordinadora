import { LoginBackground } from "@/modules/auth/login-background";
import { LoginBrand } from "@/modules/auth/login-brand";
import { LoginForm } from "@/modules/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <LoginBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div
          className="login-glass w-full max-w-[420px] rounded-2xl border border-white/10 p-6 shadow-2xl sm:p-8"
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <LoginBrand />
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
              IT Dashboard
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-300">
              Gestión ejecutiva de proyectos, operaciones y colaboración ágil
            </p>
          </div>
          <LoginForm />
          <p className="mt-6 text-center text-[11px] text-slate-400">
            Acceso seguro con autenticación corporativa
          </p>
        </div>
      </div>
    </main>
  );
}
