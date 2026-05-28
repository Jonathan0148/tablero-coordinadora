# IT Dashboard Enterprise - Postman

## Archivos

```text
postman/
  IT_Dashboard_Enterprise.postman_collection.json
  local.postman_environment.json
  README_POSTMAN.md
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
- `username`: usuario local
- `password`: password local
- `projectId`: proyecto activo para pruebas
- `teamMemberId`: miembro de equipo para pruebas de referencia
- `okrId`: OKR para referencia
- `kanbanId`: actividad Kanban para pruebas

Actualiza `username` y `password` con un usuario real de `APP_CURSOR.app_user`.

## Flujo recomendado

1. Ejecutar `Auth - Login`.
2. Confirmar que `jwtToken` queda poblado en el environment.
3. Ejecutar `Auth - Me`.
4. Ejecutar `Projects - Search`.
5. Ejecutar `Projects - Create`.
6. Ejecutar `Projects - Get By Id`.
7. Ejecutar `Project Updates - Create Append Only`.
8. Ejecutar `Project Updates - Current Status`.
9. Ejecutar `Kanban - Create Card`.
10. Ejecutar `Kanban - Update Status`.
11. Ejecutar `Dashboard - Summary`.
12. Ejecutar módulos de lectura: `Team Members - List`, `OKRs - List`, `Activity Logs - List`.

## JWT

`Auth - Login` toma:

```json
{
  "username": "{{username}}",
  "password": "{{password}}"
}
```

El backend actual retorna `accessToken`. El script de Postman guarda automáticamente:

```javascript
pm.environment.set("jwtToken", token);
```

La colección usa Authorization Bearer a nivel global:

```text
Authorization: Bearer {{jwtToken}}
```

## Tests incluidos

La colección incluye validaciones básicas:

- status code esperado
- tiempo de respuesta menor a 3000ms
- existencia de token
- shape básico de respuesta
- estructura de paginación (`content`, `page`, `size`, `totalElements`, `totalPages`)
- actualización automática de variables (`projectId`, `kanbanId`, `teamMemberId`, `okrId`)

## Notas de alineación Swagger/backend

La colección usa únicamente endpoints existentes en controllers actuales:

- `/api/v1/auth/login`
- `/api/v1/auth/refresh`
- `/api/v1/auth/me`
- `/api/v1/dashboard/summary`
- `/api/v1/committee/summary`
- `/api/v1/projects`
- `/api/v1/projects/{projectId}`
- `/api/v1/projects/{projectId}/updates`
- `/api/v1/projects/{projectId}/current-status`
- `/api/v1/projects/{projectId}/status-at`
- `/api/v1/kanban/cards`
- `/api/v1/kanban/cards/{cardId}/status`
- `/api/v1/team-members`
- `/api/v1/okrs`
- `/api/v1/activity-logs`

No se incluyeron endpoints inexistentes como creación de OKRs o CRUD completo de team members porque todavía no existen en los controllers actuales.

## Troubleshooting

### 401 Unauthorized

- Ejecuta primero `Auth - Login`.
- Verifica que `jwtToken` no esté vacío.
- Verifica `APP_JWT_SECRET` consistente durante la ejecución del backend.

### 403 Forbidden

- El usuario autenticado no tiene el permiso requerido.
- Revisa `role_permission` para el rol del usuario.
- Ejemplos de permisos:
  - `projects:read`
  - `project-updates:create`
  - `kanban:update`

### 404 Not Found

- Verifica `projectId` o `kanbanId`.
- Ejecuta primero `Projects - Search` o `Kanban - List Cards` para poblar variables.

### 400 Validation Error

- Revisa body JSON.
- Los catálogos deben usar códigos existentes:
  - `DESARROLLO`
  - `EN_CURSO`
  - `PLAN`
  - `MEDIA`
  - `PENDIENTE`

### Error de conexión

- Confirma que el backend esté corriendo en `localhost:8080`.
- Confirma que `baseUrl` sea `http://localhost:8080/api`.
