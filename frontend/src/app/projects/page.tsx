import { Suspense } from "react";
import { AppShell } from "@/layouts/app-shell";
import { AuthGuard } from "@/modules/auth/auth-guard";
import { ProjectsView } from "@/modules/projects/projects-view";
import { LoadingState } from "@/shared/components/state";

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Suspense fallback={<LoadingState />}>
          <ProjectsView />
        </Suspense>
      </AppShell>
    </AuthGuard>
  );
}
