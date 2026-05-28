# FASE 6 - Frontend Enterprise Next.js

## Alcance implementado

Esta primera iteración cubre la base de FASE 6:

- Next.js App Router con TypeScript strict.
- TailwindCSS.
- Arquitectura modular bajo `src/modules`, `src/shared`, `src/services`, `src/providers`, `src/layouts`.
- Axios + TanStack Query.
- Zustand para sesión.
- React Hook Form + Zod para login.
- JWT real contra backend Spring Boot.
- Guards de rutas con middleware y guard cliente.
- Layout enterprise con sidebar, topbar, RBAC visual y navegación.
- Consumo real de datos Oracle mediante backend:
  - dashboard
  - proyectos
  - equipo
  - OKRs
  - kanban

## Contrato API

El frontend consume exclusivamente el contrato corporativo:

```json
{
  "code": 0,
  "message": "Consulta realizada exitosamente",
  "userMessage": "Operación realizada exitosamente",
  "data": {}
}
```

La capa `services/api-client.ts` desempaqueta `data` y transforma errores en `EnterpriseApiError`.

## Configuración local

Crear `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Ejecutar:

```bash
cd frontend
npm run dev
```

Credenciales locales:

- Usuario: `admin`
- Password: `admin123`

## Seguridad

- El token JWT se usa en interceptores Axios.
- `401` limpia sesión y redirige a `/login`.
- `PermissionGate` permite render condicional por permisos reales.
- El middleware protege rutas por cookie de sesión ligera.

## Pendiente para siguientes iteraciones

- FASE 6.4 avanzada: detalle de proyecto y timeline completo append-only.
- FASE 6.5: formularios de updates con Zod.
- FASE 6.6: CRUD visual Kanban y vistas OKR más completas.
- FASE 6.7: endpoints reales Admin/RBAC si se exponen desde backend.
- FASE 6.8: hardening visual, dark mode final, drawers/dialogs y filtros avanzados.
