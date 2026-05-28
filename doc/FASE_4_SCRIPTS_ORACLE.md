# FASE 4 - Scripts Oracle ejecutables

## Objetivo

Generar una estructura SQL enterprise compatible con Oracle 19c para crear el modelo relacional definido en FASE 3, incluyendo seguridad RBAC, auditoria, catalogos, tablas funcionales, relaciones, indices, vistas, proteccion append-only y migracion JSON legacy.

No se genera frontend ni backend en esta fase.

## Estructura generada

```text
sql/oracle
  run_all_migrations.sql
  migration
    V001__sequences.sql
    V002__security_rbac_tables.sql
    V003__catalog_tables.sql
    V004__catalog_seed_data.sql
    V005__business_tables.sql
    V006__migration_audit_tables.sql
    V007__foreign_keys.sql
    V008__indexes.sql
    V009__views_and_append_only_triggers.sql
    V010__legacy_json_migration_package.sql
    V011__legacy_import_usage_template.sql
  validation
    validate_legacy_migration_counts.sql
    validate_dashboard_queries.sql
  rollback
    R001__drop_all_objects.sql
```

## Orden de ejecucion

Para ejecucion local con SQL*Plus o SQLcl desde `sql/oracle`:

```sql
@run_all_migrations.sql
```

O ejecutar manualmente en orden:

1. `V001__sequences.sql`
2. `V002__security_rbac_tables.sql`
3. `V003__catalog_tables.sql`
4. `V004__catalog_seed_data.sql`
5. `V005__business_tables.sql`
6. `V006__migration_audit_tables.sql`
7. `V007__foreign_keys.sql`
8. `V008__indexes.sql`
9. `V009__views_and_append_only_triggers.sql`
10. `V010__legacy_json_migration_package.sql`

`V011__legacy_import_usage_template.sql` es una plantilla de importacion, no debe ejecutarse sin reemplazar el CLOB por el JSON real.

## Contenido funcional

### Seguridad RBAC

Tablas:

- `app_user`
- `role`
- `permission`
- `user_role`
- `role_permission`
- `auth_refresh_token`

Seed inicial:

- `ADMIN`
- `COORDINATOR`
- `TECH_LEAD`
- `EXECUTIVE`
- `VIEWER`

Permisos iniciales:

- proyectos
- project updates
- kanban
- equipos
- asignaciones
- OKRs
- bitacora
- comite
- reportes
- migracion
- seguridad
- catalogos

### Catalogos normalizados

Tablas:

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

Los catalogos incluyen codigos normalizados y, donde aplica, `legacy_code` para mapear valores del JSON.

### Tablas funcionales

Portafolio y equipos:

- `project`
- `team_member`
- `project_assignment`

Seguimiento:

- `project_update`

Work management:

- `kanban_card`
- `notification_reminder`

Bitacora:

- `activity_log`

OKRs:

- `okr`
- `okr_activity`
- `okr_activity_milestone`

Migracion/auditoria:

- `migration_batch`
- `legacy_id_map`
- `migration_error`
- `audit_event`
- `stg_legacy_backup`

## Auditoria

Las tablas funcionales incluyen:

- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- `is_deleted`
- `deleted_at`
- `deleted_by`

Las FKs de auditoria hacia `app_user` estan aplicadas para tablas criticas (`project`, `project_update`) y pueden extenderse a las demas tablas si la politica del proyecto lo exige.

## Append-only

`project_update` tiene proteccion append-only:

- trigger `trg_project_update_append_only`
- trigger `trg_project_update_no_delete`

La regla es:

- Insert permitido.
- Update funcional prohibido.
- Delete fisico prohibido.
- Soft delete administrativo excepcional permitido.

## Vistas

Vistas generadas:

- `vw_project_current_status`
- `vw_team_member_capacity`

`vw_project_current_status` obtiene el ultimo `project_update` por proyecto usando `ROW_NUMBER()` y mantiene la tabla historica intacta.

## Indices principales

Consultas objetivo:

- dashboard ejecutivo
- semaforos
- coordinaciones
- stoppers
- latest update por proyecto
- hitos
- Kanban por estado/prioridad/vencimiento
- bitacora por fecha/area
- capacidad de equipo
- migracion por legacy ID

Indice clave:

```sql
ix_project_update__project_date(project_id, updated_at_original DESC)
```

## Migracion JSON hacia Oracle

Script principal:

```text
V010__legacy_json_migration_package.sql
```

Package:

```sql
pkg_legacy_json_migration.import_backup(p_stg_legacy_backup_id)
```

Flujo:

1. Insertar registro en `migration_batch`.
2. Insertar JSON completo en `stg_legacy_backup.raw_json`.
3. Ejecutar `pkg_legacy_json_migration.import_backup`.
4. Revisar `migration_error`.
5. Ejecutar validaciones.

Mapeo:

- `projects[] -> project`
- `teamMembers[] -> team_member`
- `projectAssignments[] -> project_assignment`
- `projectUpdates[] -> project_update`
- `kanban[] -> kanban_card`
- `logs[] -> activity_log`
- `okrs[] -> okr`
- `okrs[].activities[] -> okr_activity`
- `okrs[].activities[].metas[] -> okr_activity_milestone`

## Validacion

Scripts:

```sql
@validation/validate_legacy_migration_counts.sql
@validation/validate_dashboard_queries.sql
```

Conteos esperados del JSON actual:

- `project`: 18
- `team_member`: 12
- `project_assignment`: 46
- `project_update`: 57
- `kanban_card`: 4
- `activity_log`: 16
- `okr`: 3
- `okr_activity`: 9
- `okr_activity_milestone`: 17

## Rollback local

Script:

```sql
@rollback/R001__drop_all_objects.sql
```

Advertencia:

Este rollback elimina objetos con `DROP ... CASCADE CONSTRAINTS PURGE`. Solo debe usarse en ambientes locales/desarrollo.

## Compatibilidad Oracle 19c

Los scripts usan:

- `NUMBER`
- `VARCHAR2`
- `CLOB`
- `DATE`
- `TIMESTAMP WITH TIME ZONE`
- `JSON_TABLE`
- `IS JSON`
- constraints Oracle
- function-based unique index
- triggers PL/SQL
- views con analytic function `ROW_NUMBER()`

## Pendiente de validacion antes de FASE 5

1. Confirmar si Flyway sera la herramienta final.
2. Confirmar usuario/schema Oracle destino.
3. Confirmar si auditoria FK debe aplicarse a todas las tablas o solo criticas.
4. Confirmar si el importador PL/SQL sera definitivo o si el backend Spring Boot ejecutara la migracion.
5. Probar package de migracion contra Oracle local con el JSON real cargado como CLOB.

## Hardening Oracle 19c aplicado

Ver detalle en `FASE_4_HARDENING_ORACLE_19C.md`.

Correcciones aplicadas:

- Eliminacion/comentario de indices redundantes cubiertos por constraints unique.
- Reescritura del package de migracion para evitar helpers privados dentro de SQL estatico.
- Uso de `SELECT seq.NEXTVAL INTO ... FROM dual` en PL/SQL.
- Trigger append-only endurecido con `UPDATING('COLUMN')` para proteger columnas funcionales y CLOBs.
- Validacion de compilacion del package contra `USER_ERRORS`.
