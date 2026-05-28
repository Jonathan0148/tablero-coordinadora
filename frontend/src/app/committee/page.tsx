import { AppShell } from "@/layouts/app-shell";
import { AuthGuard } from "@/modules/auth/auth-guard";
import { CommitteeView } from "@/modules/committee/committee-view";

export default function CommitteePage() {
  return (
    <AuthGuard>
      <AppShell>
        <CommitteeView />
      </AppShell>
    </AuthGuard>
  );
}
