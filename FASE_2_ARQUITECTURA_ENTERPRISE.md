# FASE 2 - Arquitectura enterprise y modelo relacional detallado

## 1. Objetivo de la FASE 2

Definir la arquitectura completa de la nueva plataforma enterprise que reemplazara el tablero legacy, manteniendo toda la funcionalidad actual y preservando la trazabilidad historica del JSON original.

Esta fase no genera implementacion masiva. El objetivo es cerrar decisiones de arquitectura, dominio, seguridad, auditoria, APIs, frontend, backend, Oracle y migracion.

## 2. Principios arquitectonicos

1. Oracle 19c sera la unica fuente de verdad funcional.
2. Spring Boot sera el unico responsable de persistencia, reglas de negocio, auditoria, seguridad y exposicion de APIs.
3. Next.js sera una capa de experiencia de usuario, sin persistencia funcional en `localStorage`.
4. El JSON legacy sera usado solo como fuente inicial de migracion.
5. Las entidades tendran PKs relacionales modernas con sequences.
6. Todo registro migrado preservara `legacy_id` cuando exista.
7. `project_update` sera append-only.
8. La arquitectura debe permitir reconstruccion historica de estados.
9. La seguridad sera transversal con JWT, RBAC y autorizacion por modulo/accion.
10. Las migraciones Oracle deben estar versionadas y ejecutarse controladamente con Flyway o Liquibase.

## 3. Bounded contexts

### 3.1 Identity & Access

Responsable de usuarios, roles, permisos, autenticacion JWT, refresh tokens, autorizacion por modulo y auditoria de acceso.

Entidades principales:

- `app_user`
- `role`
- `permission`
- `user_role`
- `role_permission`
- `auth_refresh_token`
- `login_audit`

### 3.2 Portfolio Management

Responsable del portafolio de proyectos, estado pipeline, filtros, vista de proyectos y relacion con seguimiento ejecutivo.

Entidades principales:

- `project`
- `pipeline_status`
- `project_assignment`
- `team_member`
- `tech_role`

### 3.3 Executive Tracking

Responsable de actualizaciones historicas, semaforo, stoppers, riesgos, hitos, decisiones y coordinaciones.

Entidades principales:

- `project_update`
- `executive_status`
- `traffic_light`
- `stopper_impact`
- `responsible_area`

Regla central:

- `project_update` es append-only.
- El estado actual se obtiene desde el ultimo update por proyecto.
- El estado historico se reconstruye consultando el ultimo update anterior o igual a una fecha de corte.

### 3.4 Work Management

Responsable del Kanban de actividades, prioridades, estados, areas, fechas limite y recordatorios.

Entidades principales:

- `kanban_card`
- `work_area`
- `kanban_status`
- `priority_level`
- `notification_reminder`

### 3.5 Team & Capacity

Responsable de personas, roles, asignaciones, liderazgo tecnico y carga de recursos.

Entidades principales:

- `team_member`
- `project_assignment`
- `tech_role`
- vistas o queries de carga por persona

### 3.6 OKR Management

Responsable de OKRs, actividades, progreso, estado, responsables, dependencias, entregables y metas.

Entidades principales:

- `okr`
- `okr_activity`
- `okr_activity_milestone`
- `okr_status`

### 3.7 Activity Log

Responsable de bitacora operativa diaria.

Entidades principales:

- `activity_log`
- `work_area`

### 3.8 Migration & Audit

Responsable de trazabilidad de importaciones, equivalencias legacy, auditoria de cambios y control de calidad de migracion.

Entidades principales:

- `migration_batch`
- `migration_error`
- `legacy_id_map`
- `audit_event`

## 4. Arquitectura backend Spring Boot

### 4.1 Stack backend

- Java 21
- Spring Boot 3.x
- Maven
- Spring Web
- Spring Security
- JWT
- Spring Data JPA / Hibernate
- Oracle JDBC
- Bean Validation
- MapStruct
- Lombok
- Swagger/OpenAPI
- Flyway o Liquibase
- Logback estructurado

### 4.2 Estilo arquitectonico

Arquitectura limpia por capas y modulos de dominio:

```text
com.coltefinanciera.itdashboard
  config
  security
  shared
    audit
    exception
    pagination
    validation
    api
  identity
    domain
    application
    infrastructure
    web
  portfolio
    domain
    application
    infrastructure
    web
  tracking
    domain
    application
    infrastructure
    web
  work
    domain
    application
    infrastructure
    web
  team
    domain
    application
    infrastructure
    web
  okr
    domain
    application
    infrastructure
    web
  logbook
    domain
    application
    infrastructure
    web
  migration
    domain
    application
    infrastructure
    web
```

### 4.3 Responsabilidades por capa

#### `domain`

- Entidades JPA.
- Enums o referencias a catalogos.
- Reglas invariantes del dominio.
- Value objects simples cuando aplique.

#### `application`

- Casos de uso.
- Servicios transaccionales.
- Coordinacion entre repositorios.
- Validaciones de negocio.
- Logica de reconstruccion historica.
- Logica de migracion JSON a entidades.

#### `infrastructure`

- Repositorios JPA.
- Specifications para filtros.
- Integracion con Oracle.
- Implementaciones tecnicas.

#### `web`

- REST controllers.
- DTOs request/response.
- Mappers MapStruct.
- OpenAPI annotations.
- Paginacion y filtros.

### 4.4 Reglas transaccionales

- Comandos de escritura deben ejecutarse en transacciones explicitas.
- Lecturas complejas deben usar queries optimizadas, projections o specifications.
- `project_update` no expone endpoint funcional de update; solo creacion y consulta.
- Eliminaciones funcionales deben preferir soft delete cuando exista impacto historico.
- Los catalogos deben ser administrables solo por roles autorizados.

## 5. Auditoria transversal

### 5.1 Campos estandar

Todas las tablas funcionales principales deben incluir:

- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

Cuando aplique:

- `deleted_at`
- `deleted_by`
- `is_deleted`

### 5.2 Estrategia JPA

Usar una clase base auditable:

- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`
- `deletedAt`
- `deletedBy`
- `deleted`

Integracion con:

- Spring Data JPA Auditing
- `AuditorAware`
- usuario autenticado JWT

### 5.3 Auditoria historica funcional

No confundir auditoria tecnica con historico funcional:

- Auditoria tecnica: quien creo/actualizo/eliminar logicamente registros.
- Historico funcional: `project_update` append-only con estado ejecutivo en el tiempo.

### 5.4 Eventos de auditoria

Tabla recomendada `audit_event`:

- `audit_event_id`
- `event_type`
- `entity_name`
- `entity_id`
- `legacy_id`
- `action`
- `summary`
- `before_hash`
- `after_hash`
- `performed_by`
- `performed_at`
- `ip_address`
- `user_agent`

Uso:

- Login/logout.
- Importaciones.
- Creacion de updates.
- Cambios de asignaciones.
- Eliminaciones logicas.
- Cambios de permisos.

## 6. Seguridad, JWT y RBAC

### 6.1 Modelo de seguridad

Autenticacion:

- Login con usuario/password.
- Password con BCrypt.
- Access token JWT de corta duracion.
- Refresh token persistido y revocable.

Autorizacion:

- RBAC por rol.
- Permisos granulares por modulo y accion.
- Anotaciones de metodo con `@PreAuthorize`.

### 6.2 Roles iniciales

- `ADMIN`: administracion total.
- `COORDINATOR`: gestiona proyectos, updates, equipos, asignaciones, OKRs y bitacora.
- `TECH_LEAD`: consulta portafolio y registra updates/tareas de proyectos asignados.
- `EXECUTIVE`: consulta dashboards, vista comite, semaforos e historicos.
- `VIEWER`: consulta de solo lectura.

### 6.3 Permisos iniciales

Formato sugerido:

```text
module:action
```

Permisos:

- `projects:read`
- `projects:create`
- `projects:update`
- `projects:delete`
- `project-updates:read`
- `project-updates:create`
- `project-updates:delete`
- `kanban:read`
- `kanban:create`
- `kanban:update`
- `kanban:delete`
- `teams:read`
- `teams:create`
- `teams:update`
- `teams:delete`
- `assignments:read`
- `assignments:create`
- `assignments:update`
- `assignments:delete`
- `okrs:read`
- `okrs:update`
- `logs:read`
- `logs:create`
- `logs:delete`
- `committee:read`
- `reports:read`
- `migration:execute`
- `security:admin`
- `catalogs:admin`

### 6.4 Autorizacion por modulo

Cada endpoint debe declarar permiso requerido. Ejemplos:

- `GET /api/v1/projects` requiere `projects:read`.
- `POST /api/v1/projects/{id}/updates` requiere `project-updates:create`.
- `GET /api/v1/committee/summary` requiere `committee:read`.
- `POST /api/v1/migrations/legacy-json` requiere `migration:execute`.

## 7. Estrategia API REST

### 7.1 Versionamiento

Usar versionado por path:

```text
/api/v1
```

Motivos:

- Claro para frontend.
- Compatible con Swagger.
- Permite evolucionar contratos.

### 7.2 Convenciones REST

- Recursos en plural.
- Filtros por query params.
- Paginacion estandar.
- Respuestas consistentes.
- Errores normalizados.

Ejemplo de paginacion:

```text
GET /api/v1/projects?page=0&size=20&sort=updatedAt,desc
```

Respuesta paginada:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

### 7.3 Contrato de errores

Formato estandar:

```json
{
  "timestamp": "2026-05-27T00:00:00Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Datos invalidos",
  "path": "/api/v1/projects",
  "details": [
    {
      "field": "name",
      "message": "El nombre es obligatorio"
    }
  ]
}
```

### 7.4 Endpoints principales

#### Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

#### Projects

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/{projectId}`
- `PUT /api/v1/projects/{projectId}`
- `DELETE /api/v1/projects/{projectId}`
- `GET /api/v1/projects/{projectId}/timeline`
- `GET /api/v1/projects/{projectId}/current-status`

#### Project updates

- `GET /api/v1/projects/{projectId}/updates`
- `POST /api/v1/projects/{projectId}/updates`
- `GET /api/v1/project-updates/{updateId}`
- `DELETE /api/v1/project-updates/{updateId}` solo soft delete o permiso administrativo

No debe existir `PUT /project-updates/{id}` para uso funcional regular.

#### Historical reconstruction

- `GET /api/v1/projects/{projectId}/status-at?at=2026-05-01T00:00:00Z`
- `GET /api/v1/projects/{projectId}/history?from=...&to=...`

#### Kanban

- `GET /api/v1/kanban/cards`
- `POST /api/v1/kanban/cards`
- `GET /api/v1/kanban/cards/{cardId}`
- `PUT /api/v1/kanban/cards/{cardId}`
- `PATCH /api/v1/kanban/cards/{cardId}/status`
- `DELETE /api/v1/kanban/cards/{cardId}`

#### Teams

- `GET /api/v1/team-members`
- `POST /api/v1/team-members`
- `GET /api/v1/team-members/{memberId}`
- `PUT /api/v1/team-members/{memberId}`
- `DELETE /api/v1/team-members/{memberId}`
- `GET /api/v1/team-members/{memberId}/capacity`

#### Assignments

- `GET /api/v1/project-assignments`
- `POST /api/v1/project-assignments`
- `PUT /api/v1/project-assignments/{assignmentId}`
- `DELETE /api/v1/project-assignments/{assignmentId}`

#### OKRs

- `GET /api/v1/okrs`
- `GET /api/v1/okrs/{okrId}`
- `PUT /api/v1/okr-activities/{activityId}/progress`
- `PUT /api/v1/okr-activities/{activityId}/status`

#### Logbook

- `GET /api/v1/activity-logs`
- `POST /api/v1/activity-logs`
- `DELETE /api/v1/activity-logs/{logId}`

#### Dashboards

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/committee/summary`
- `GET /api/v1/alerts`

#### Migration

- `POST /api/v1/migrations/legacy-json/validate`
- `POST /api/v1/migrations/legacy-json/import`
- `GET /api/v1/migrations/{batchId}`
- `GET /api/v1/migrations/{batchId}/errors`

## 8. DTO strategy

### 8.1 Convenciones

Request DTOs:

- `CreateProjectRequest`
- `UpdateProjectRequest`
- `CreateProjectUpdateRequest`
- `CreateKanbanCardRequest`
- `UpdateKanbanCardRequest`

Response DTOs:

- `ProjectResponse`
- `ProjectDetailResponse`
- `ProjectCurrentStatusResponse`
- `ProjectUpdateResponse`
- `KanbanCardResponse`
- `DashboardSummaryResponse`
- `CommitteeSummaryResponse`

DTOs de migracion:

- `LegacyBackupImportRequest`
- `LegacyProjectDto`
- `LegacyProjectUpdateDto`
- `LegacyKanbanCardDto`
- `LegacyOkrDto`

### 8.2 Regla para nombres legacy

En DTOs operativos se usan nombres limpios y consistentes con TypeScript.

En DTOs de migracion se preservan nombres exactos del JSON legacy:

- `pipelineStatus`
- `updatedAt`
- `projectId`
- `hasStopper`
- `stopperDesc`
- `requiresCoordination`
- `coordinationDesc`
- `nextMilestoneDate`

Esto evita perdida semantica durante importacion.

### 8.3 Tipos compartidos frontend/backend

Se recomienda generar tipos TypeScript desde OpenAPI o mantener contratos manuales estrictos alineados con Swagger.

Estrategia recomendada:

- Backend define OpenAPI como contrato fuente.
- Frontend genera tipos o cliente API a partir de OpenAPI.
- Validaciones frontend con Zod deben reflejar constraints backend.

## 9. Modelo Oracle detallado a nivel logico

Esta seccion define el modelo relacional esperado. Los scripts `CREATE TABLE`, sequences, constraints e inserts quedan para la FASE 4.

### 9.1 Tablas transversales

#### `app_user`

- `user_id` PK
- `username`
- `email`
- `password_hash`
- `full_name`
- `active`
- `last_login_at`
- auditoria transversal

#### `role`

- `role_id` PK
- `code`
- `name`
- `description`
- auditoria transversal

#### `permission`

- `permission_id` PK
- `code`
- `module`
- `action`
- `description`
- auditoria transversal

#### `user_role`

- `user_role_id` PK
- `user_id` FK
- `role_id` FK
- auditoria transversal

#### `role_permission`

- `role_permission_id` PK
- `role_id` FK
- `permission_id` FK
- auditoria transversal

#### `migration_batch`

- `migration_batch_id` PK
- `source_file_name`
- `source_version`
- `exported_at`
- `exported_date_label`
- `status`
- `total_records`
- `success_records`
- `error_records`
- `started_at`
- `finished_at`
- auditoria transversal

#### `legacy_id_map`

- `legacy_id_map_id` PK
- `migration_batch_id` FK
- `entity_type`
- `legacy_id`
- `new_entity_id`
- `new_entity_table`
- `notes`
- auditoria transversal

### 9.2 Catalogos

Catalogos recomendados:

- `pipeline_status`
- `executive_status`
- `traffic_light`
- `work_area`
- `kanban_status`
- `priority_level`
- `stopper_impact`
- `responsible_area`
- `tech_role`
- `okr_activity_status`

Estructura comun sugerida:

- `<catalog>_id` PK
- `code`
- `name`
- `description`
- `sort_order`
- `active`
- auditoria transversal

### 9.3 Portafolio y equipos

#### `project`

- `project_id` PK sequence
- `legacy_id`
- `name`
- `pipeline_status_id` FK
- `start_date`
- `legacy_updated_at`
- `is_ghost`
- auditoria transversal
- soft delete opcional

Indices:

- unique `legacy_id`
- index `pipeline_status_id`
- index `legacy_updated_at`

#### `team_member`

- `team_member_id` PK sequence
- `legacy_id`
- `name`
- `default_role_id` FK a `tech_role`
- `email`
- `active`
- `notes`
- auditoria transversal
- soft delete opcional

Indices:

- unique `legacy_id`
- index `default_role_id`
- index `active`

#### `project_assignment`

- `project_assignment_id` PK sequence
- `legacy_id`
- `project_id` FK
- `team_member_id` FK
- `role_id` FK a `tech_role`
- `is_lead`
- `valid_from`
- `valid_to`
- auditoria transversal
- soft delete opcional

Constraints:

- unique funcional para evitar duplicados activos por proyecto/persona/rol.
- liderazgo unico activo por proyecto mediante indice funcional o validacion transaccional.

### 9.4 Seguimiento ejecutivo

#### `project_update`

- `project_update_id` PK sequence
- `legacy_id`
- `project_id` FK
- `updated_at_original`
- `executive_status_id` FK
- `traffic_light_id` FK
- `summary`
- `pending_items`
- `has_stopper`
- `stopper_desc`
- `stopper_owner`
- `stopper_impact_id` FK nullable
- `relevant_risks`
- `next_milestone`
- `next_milestone_date`
- `pending_decisions`
- `requires_coordination`
- `coordination_desc`
- `responsible_area_id` FK nullable
- `responsible_action`
- `additional_notes`
- auditoria transversal

Reglas:

- Append-only.
- No update funcional regular.
- `updated_at_original` conserva timestamp legacy o timestamp de creacion funcional.
- `traffic_light_id` preserva snapshot historico.

Indices:

- index `(project_id, updated_at_original desc)`
- index `traffic_light_id`
- index `executive_status_id`
- index `requires_coordination`
- index `has_stopper`
- unique `legacy_id` cuando no sea null.

### 9.5 Kanban y recordatorios

#### `kanban_card`

- `kanban_card_id` PK sequence
- `legacy_id`
- `text`
- `work_area_id` FK
- `priority_level_id` FK
- `kanban_status_id` FK
- `due_date`
- `reminder_at`
- `project_id` FK nullable
- `created_at_original`
- auditoria transversal
- soft delete opcional

Indices:

- index `kanban_status_id`
- index `priority_level_id`
- index `due_date`
- index `reminder_at`
- index `project_id`

#### `notification_reminder`

- `notification_reminder_id` PK sequence
- `kanban_card_id` FK nullable
- `project_update_id` FK nullable
- `reminder_at`
- `status`
- `sent_at`
- `channel`
- auditoria transversal

### 9.6 Bitacora

#### `activity_log`

- `activity_log_id` PK sequence
- `legacy_id`
- `text`
- `work_area_id` FK
- `logged_at_original`
- auditoria transversal
- soft delete opcional

Indices:

- index `logged_at_original`
- index `work_area_id`

### 9.7 OKRs

#### `okr`

- `okr_id` PK sequence
- `legacy_id`
- `name`
- `sort_order`
- auditoria transversal
- soft delete opcional

#### `okr_activity`

- `okr_activity_id` PK sequence
- `okr_id` FK
- `legacy_id`
- `pct`
- `status_id` FK a `okr_activity_status`
- `text`
- `responsible`
- `dependency`
- `deliverable`
- `sort_order`
- auditoria transversal

#### `okr_activity_milestone`

- `okr_activity_milestone_id` PK sequence
- `okr_activity_id` FK
- `quarter_code`
- `quarter_label`
- `month_abbr`
- `pct`
- `sort_order`
- auditoria transversal

### 9.8 Auditoria

#### `audit_event`

- `audit_event_id` PK sequence
- `event_type`
- `entity_name`
- `entity_id`
- `legacy_id`
- `action`
- `summary`
- `before_hash`
- `after_hash`
- `performed_by`
- `performed_at`
- `ip_address`
- `user_agent`

## 10. Estrategia Oracle migrations

### 10.1 Herramienta recomendada

Se recomienda Flyway por simplicidad y control SQL directo en Oracle.

Liquibase tambien es valido si se requiere rollback declarativo o changelog multi-formato.

Decision recomendada:

- Flyway para scripts SQL versionados.
- Scripts escritos explicitamente para Oracle 19c.

### 10.2 Estructura de scripts

```text
db/migration
  V001__create_security_tables.sql
  V002__create_catalog_tables.sql
  V003__insert_catalog_seed_data.sql
  V004__create_portfolio_tables.sql
  V005__create_tracking_tables.sql
  V006__create_work_tables.sql
  V007__create_okr_tables.sql
  V008__create_logbook_tables.sql
  V009__create_migration_audit_tables.sql
  V010__create_indexes.sql
  V011__create_constraints.sql
  V012__insert_initial_admin_user.sql
  V013__legacy_json_import_staging.sql
```

### 10.3 Orden de dependencias

1. Seguridad.
2. Catalogos.
3. Datos semilla de catalogos.
4. Entidades base: proyectos, miembros.
5. Relaciones: asignaciones.
6. Historicos: project updates.
7. Work management.
8. OKRs.
9. Bitacora.
10. Migracion y auditoria.
11. Indices.
12. Constraints adicionales.

## 11. Estrategia de migracion JSON a Oracle

### 11.1 Fases de migracion

1. Validar JSON.
2. Crear `migration_batch`.
3. Cargar catalogos requeridos.
4. Migrar proyectos y registrar `legacy_id_map`.
5. Migrar team members.
6. Migrar project assignments resolviendo FKs por legacy ID.
7. Migrar project updates append-only.
8. Migrar Kanban.
9. Migrar logs.
10. Migrar OKRs, actividades y metas.
11. Validar conteos.
12. Generar reporte de errores.

### 11.2 Reglas de conciliacion

- Comparar conteos JSON vs Oracle por entidad.
- Validar relaciones resueltas.
- Validar proyectos sin update como casos permitidos.
- Validar Kanban sin proyecto como FK nullable.
- Validar IDs legacy duplicados por entidad.
- Registrar errores sin abortar todo el batch cuando sea posible.

### 11.3 Modalidades posibles

Modalidad recomendada:

- Importador backend Spring Boot que recibe JSON, valida y persiste.

Modalidad complementaria:

- Scripts SQL de staging para carga controlada desde tablas temporales.

## 12. Arquitectura frontend Next.js

### 12.1 Stack frontend

- Next.js 15
- TypeScript
- TailwindCSS
- shadcn/ui
- Axios
- React Query
- React Hook Form
- Zod
- App Router
- Arquitectura modular por feature

### 12.2 Estructura sugerida

```text
src
  app
    (auth)
    (dashboard)
    api-client
  features
    auth
    dashboard
    projects
    project-updates
    kanban
    teams
    okrs
    logbook
    committee
    alerts
    migration
  shared
    components
    hooks
    lib
    schemas
    types
    ui
```

### 12.3 Modulos frontend

#### Auth

- Login.
- Refresh token handling.
- Guardas de ruta.
- Permisos por modulo.

#### Dashboard

- KPIs.
- Semaforo general.
- Proximos hitos.
- Proyectos sin actualizacion.
- Alertas.
- Bitacora reciente.

#### Projects

- Grid premium.
- Filtros por pipeline, semaforo, responsable, estado, actualizacion.
- Panel lateral de detalle.
- Timeline historico.
- Estado actual y reconstruccion historica.

#### Project updates

- Formulario con React Hook Form y Zod.
- Validacion de campos obligatorios.
- Preview de semaforo.
- Creacion append-only.
- Historial no editable funcionalmente.

#### Kanban

- Columnas.
- Drag and drop.
- Filtros por prioridad, area, proyecto y vencimiento.
- Recordatorios backend-driven.

#### Teams

- Personas.
- Asignaciones.
- Carga por recurso.
- Liderazgo tecnico.

#### OKRs

- Objetivos.
- Actividades.
- Metas.
- Avance.
- Estados.

#### Committee

- Vista ejecutiva optimizada.
- Atencion inmediata.
- Seguimiento.
- Recursos.
- Hitos.

#### Logbook

- Registro diario.
- Busqueda.
- Filtros por area y fecha.

### 12.4 Manejo de estado frontend

- React Query para cache server-state.
- Estado UI local con React state.
- `localStorage` solo para tema, preferencias visuales o filtros temporales no funcionales.
- No guardar proyectos, updates, logs, OKRs, equipos ni Kanban en `localStorage`.

## 13. Naming conventions

### 13.1 Oracle

- Tablas en singular o plural consistente. Recomendacion: singular snake_case.
- Columnas snake_case.
- PK: `<table>_id`.
- FK: `<referenced_table>_id`.
- Legacy: `legacy_id`.
- Auditoria: `created_at`, `updated_at`, `created_by`, `updated_by`.

### 13.2 Java

- Paquetes por bounded context.
- Entidades: `Project`, `ProjectUpdate`.
- DTOs: `ProjectResponse`, `CreateProjectRequest`.
- Repositorios: `ProjectRepository`.
- Servicios: `ProjectService`, `ProjectUpdateService`.
- Mappers: `ProjectMapper`.

### 13.3 TypeScript

- Tipos: `Project`, `ProjectUpdate`, `ProjectResponse`.
- Hooks: `useProjects`, `useProjectUpdates`.
- Schemas Zod: `projectSchema`, `createProjectUpdateSchema`.
- Servicios API: `projectsApi`, `kanbanApi`.

## 14. Calidad y mantenibilidad

### 14.1 Backend

- Manejo global de excepciones.
- Validaciones Bean Validation.
- DTO pattern estricto.
- MapStruct para mapping.
- Specifications para filtros.
- Paginacion estandar.
- Logs estructurados.
- OpenAPI completo.
- Tests unitarios en servicios criticos.
- Tests de integracion para migracion y repositorios.

### 14.2 Frontend

- Componentes reutilizables.
- Formularios tipados.
- Zod para validacion.
- React Query para cache y revalidacion.
- Manejo centralizado de errores API.
- Accesibilidad en formularios, modales, tablas y navegacion.
- Diseño responsive.
- UI enterprise con shadcn/ui.

## 15. Decisiones cerradas de FASE 2

1. Se usaran PKs relacionales nuevas en Oracle.
2. `legacy_id` preservara trazabilidad.
3. `project_update` sera append-only.
4. Oracle sera fuente de verdad.
5. No habra persistencia funcional en `localStorage`.
6. Seguridad con JWT + RBAC.
7. Auditoria transversal en tablas funcionales.
8. Migraciones versionadas con Flyway recomendado.
9. APIs REST versionadas bajo `/api/v1`.
10. Frontend modular por features.
11. Backend modular por bounded contexts.
12. OpenAPI sera el contrato fuente para alinear frontend/backend.

## 16. Pendiente para FASE 3

La siguiente fase debe convertir este modelo logico en modelo relacional Oracle fisico:

- Definir tipos Oracle exactos.
- Definir `CREATE TABLE`.
- Definir sequences.
- Definir PK/FK.
- Definir checks.
- Definir unique constraints.
- Definir indexes.
- Definir inserts de catalogos.
- Definir orden exacto de ejecucion.
