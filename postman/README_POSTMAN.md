# IT Dashboard Enterprise - Postman

## Archivos

```text
postman/
  IT_Dashboard_Enterprise.postman_collection.json
  local.postman_environment.json
  README_POSTMAN.md
  update-collection.mjs
```

## Importar en Postman

1. Abrir Postman.
2. `Import`.
3. Seleccionar:
   - `IT_Dashboard_Enterprise.postman_collection.json`
   - `local.postman_environment.json`
4. Activar el environment `IT Dashboard Enterprise - Local`.

## Backend requerido

Ejecutar el backend:

```bash
cd backend
mvn spring-boot:run
```

Base URL esperada:

```text
http://localhost:8080/api
```

Los endpoints reales del backend usan `/api/v1`, por eso la colección llama rutas como:

```text
{{baseUrl}}/v1/projects
```

## Variables del environment

- `baseUrl`: `http://localhost:8080/api`
- `jwtToken`: token JWT guardado automáticamente al hacer login
- `refreshToken`: reservado; se guarda si el backend lo retorna
- `email`: email corporativo del usuario local (`admin@local.dev`)
- `password`: password local
- `userId`: usuario activo para pruebas de administración
- `roleId`: rol activo para pruebas de administración
- `projectId`: proyecto activo para pruebas
- `teamMemberId`: miembro de equipo para pruebas de referencia
- `okrId`: OKR para referencia
- `kanbanId`: actividad Kanban para pruebas

Actualiza `email` y `password` con un usuario real de `APP_CURSOR.app_user`.

## Flujo recomendado

1. Ejecutar `Auth - Login` (autenticación por **email**).
2. Confirmar que `jwtToken` queda poblado en el environment.
3. Ejecutar `Auth - Me`.
4. Ejecutar `Administración > Usuarios - Listar` (requiere `security:admin`).
5. Ejecutar `Projects - Search`.
6. Ejecutar `Projects - Create`.
7. Ejecutar `Projects - Get By Id`.
8. Ejecutar `Project Updates - Create Append Only`.
9. Ejecutar `Project Updates - Current Status`.
10. Ejecutar `Kanban - Create Card`.
11. Ejecutar `Kanban - Update Status`.
12. Ejecutar `Dashboard - Summary`, `Dashboard - Executive`, `Dashboard - Alerts`.
13. Ejecutar módulos de lectura: `Team Members - List`, `OKRs - List`, `Activity Logs - List`.

## JWT

`Auth - Login` envía:

```json
{
  "email": "{{email}}",
  "password": "{{password}}"
}
```

El backend retorna `accessToken`. El script de Postman guarda automáticamente:

```javascript
pm.environment.set("jwtToken", token);
```

La colección usa Authorization Bearer a nivel global:

```text
Authorization: Bearer {{jwtToken}}
```

## Estructura de la colección

- **Auth**: Login, Refresh, Me
- **Administración**: Usuarios, Roles, Permisos
- **Dashboard**: Summary, Executive, Alerts, Committee
- **Projects**, **Project Updates**, **Kanban**, **Team Members**, **OKRs**, **Activity Logs**

## Tests incluidos

La colección incluye validaciones básicas:

- status code esperado
- tiempo de respuesta menor a 3000ms
- existencia de token
- shape básico de respuesta enterprise (`code`, `message`, `userMessage`, `data`)
- estructura de paginación (`content`, `page`, `size`, `totalElements`, `totalPages`)
- actualización automática de variables (`userId`, `roleId`, `projectId`, `kanbanId`, etc.)

## Notas de alineación Swagger/backend

La colección usa únicamente endpoints existentes en controllers actuales:

- `/api/v1/auth/login` (email + password)
- `/api/v1/auth/refresh`
- `/api/v1/auth/me`
- `/api/v1/admin/users`, `/api/v1/admin/roles`, `/api/v1/admin/permissions`
- `/api/v1/dashboard/summary`, `/executive`, `/alerts`
- `/api/v1/committee/summary`
- `/api/v1/projects` y sub-recursos
- `/api/v1/kanban/cards`
- `/api/v1/team-members`
- `/api/v1/okrs`
- `/api/v1/activity-logs`

## Troubleshooting

### 401 Unauthorized

- Ejecuta primero `Auth - Login`.
- Verifica que `jwtToken` no esté vacío.
- Confirma que el login usa **email**, no username.
- Verifica `APP_JWT_SECRET` consistente durante la ejecución del backend.

### 403 Forbidden

- El usuario autenticado no tiene el permiso requerido.
- Administración requiere `security:admin`.
- Revisa `role_permission` para el rol del usuario.

### 404 Not Found

- Verifica `projectId`, `userId`, `roleId` o `kanbanId`.
- Ejecuta primero los endpoints List para poblar variables.

### 400 Validation Error

- Revisa body JSON.
- Login requiere email válido (`admin@local.dev` en local).

### Error de conexión

- Confirma que el backend esté corriendo en `localhost:8080`.
- Confirma que `baseUrl` sea `http://localhost:8080/api`.
