import { AppShell } from "@/layouts/app-shell";
import { AdminUsersView } from "@/modules/admin/admin-users-view";
import { AuthGuard } from "@/modules/auth/auth-guard";
import { PermissionGate } from "@/shared/components/permission-gate";
import { Card, CardContent } from "@/shared/components/card";

export default function AdminUsersPage() {
  return (
    <AuthGuard>
      <AppShell>
        <PermissionGate
          permission="security:admin"
          fallback={
            <Card className="m-4 sm:m-6">
              <CardContent className="py-10">
                <h2 className="text-xl font-bold text-app-fg">Acceso restringido</h2>
                <p className="mt-2 text-sm text-app-muted">
                  Esta vista requiere permisos de administración del sistema.
                </p>
              </CardContent>
            </Card>
          }
        >
          <AdminUsersView />
        </PermissionGate>
      </AppShell>
    </AuthGuard>
  );
}
