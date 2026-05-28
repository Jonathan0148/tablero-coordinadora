import { AppShell } from "@/layouts/app-shell";
import { AuthGuard } from "@/modules/auth/auth-guard";
import { KanbanView } from "@/modules/kanban/kanban-view";

export default function KanbanPage() {
  return (
    <AuthGuard>
      <AppShell>
        <KanbanView />
      </AppShell>
    </AuthGuard>
  );
}
