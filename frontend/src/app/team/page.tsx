import { AppShell } from "@/layouts/app-shell";
import { AuthGuard } from "@/modules/auth/auth-guard";
import { TeamView } from "@/modules/team/team-view";

export default function TeamPage() {
  return (
    <AuthGuard>
      <AppShell>
        <TeamView />
      </AppShell>
    </AuthGuard>
  );
}
