import { AppShell } from "@/layouts/app-shell";
import { AuthGuard } from "@/modules/auth/auth-guard";
import { OkrsView } from "@/modules/okrs/okrs-view";

export default function OkrsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <OkrsView />
      </AppShell>
    </AuthGuard>
  );
}
