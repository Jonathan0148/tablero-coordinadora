import { AuthGuard } from "@/modules/auth/auth-guard";
import { DashboardView } from "@/modules/dashboard/dashboard-view";
import { AppShell } from "@/layouts/app-shell";

export default function Home() {
  return (
    <AuthGuard>
      <AppShell>
        <DashboardView />
      </AppShell>
    </AuthGuard>
  );
}
