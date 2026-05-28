import { AppShell } from "@/layouts/app-shell";
import { AuthGuard } from "@/modules/auth/auth-guard";
import { LogView } from "@/modules/log/log-view";

export default function LogPage() {
  return (
    <AuthGuard>
      <AppShell>
        <LogView />
      </AppShell>
    </AuthGuard>
  );
}
