import { AppShell } from "@/layouts/app-shell";
import { AuthGuard } from "@/modules/auth/auth-guard";
import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { PermissionGate } from "@/shared/components/permission-gate";

export default function AdminPage() {
  return (
    <AuthGuard>
      <AppShell>
        <PermissionGate
          permission="security:admin"
          fallback={
            <Card>
              <CardContent>
                <h2 className="text-2xl font-bold">No tienes permisos para acceder</h2>
                <p className="mt-2 text-slate-500">Esta vista requiere permisos RBAC de administración.</p>
              </CardContent>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Admin / RBAC</h2>
              <p className="text-sm text-slate-500">Base visual para administración de roles y permisos reales.</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                La administración completa se implementará sobre los endpoints RBAC cuando se expongan desde backend.
                Esta ruta ya está protegida por permisos reales del JWT.
              </p>
            </CardContent>
          </Card>
        </PermissionGate>
      </AppShell>
    </AuthGuard>
  );
}
