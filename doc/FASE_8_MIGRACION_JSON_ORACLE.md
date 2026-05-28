# FASE 8 - Migracion JSON a Oracle 19c

## Objetivo

Poblar el esquema Oracle `APP_CURSOR` con el backup real `tablero_IT_respaldo_2026-05-19.json`, preservando datos funcionales, IDs legacy, relaciones historicas y trazabilidad de migracion.

La migracion mantiene Oracle como fuente de verdad. El JSON se usa solo como fuente inicial de carga y queda respaldado en `stg_legacy_backup.raw_json`.

## Estrategia enterprise

1. Crear esquema base con `sql/oracle/run_all_migrations.sql`.
2. Sembrar catalogos, RBAC y usuario local `admin`.
3. Cargar el JSON completo en staging (`stg_legacy_backup`) como CLOB validado con `IS JSON`.
4. Crear un `migration_batch` por ejecucion.
5. Ejecutar `pkg_legacy_json_migration.import_backup`.
6. Insertar datos normalizados por dominio:
   - `project`
   - `team_member`
   - `project_assignment`
   - `project_update`
   - `kanban_card`
   - `activity_log`
   - `okr`
   - `okr_activity`
   - `okr_activity_milestone`
7. Registrar equivalencias en `legacy_id_map`.
8. Registrar errores por entidad en `migration_error`.
9. Validar conteos, referencias, duplicados y errores.
10. Para reimportar, ejecutar rollback del batch y luego repetir la importacion.

## Preservacion de datos

- Los textos funcionales largos se cargan hacia columnas `CLOB`.
- `project_update` conserva snapshots historicos y no se actualiza durante la migracion.
- Los IDs legacy se guardan en cada tabla funcional cuando existe columna `legacy_id`.
- Las equivalencias legacy -> Oracle se registran en `legacy_id_map`.
- El JSON original completo se conserva en `stg_legacy_backup` para auditoria tecnica.

## Usuario administrador local

El script `sql/oracle/migration/V012__local_admin_seed.sql` crea o reactiva de forma idempotente:

- Usuario: `admin`
- Password temporal: `admin123`
- Rol: `ADMIN`
- Permisos: todos los permisos activos de RBAC

La contraseña se almacena como hash BCrypt generado con `BCryptPasswordEncoder`, compatible con Spring Security, JWT, Swagger, Postman y el frontend futuro.

Este usuario es solo para entorno local/desarrollo. Antes de cualquier ambiente productivo debe cambiarse la contraseña o reemplazarse por un mecanismo de aprovisionamiento seguro.

## Orden de ejecucion local

Desde `sql/oracle`, conectado como `APP_CURSOR`:

```sql
@run_all_migrations.sql
@import/run_import_tablero_2026_05_19.sql
@validation/validate_legacy_migration_counts.sql
@validation/validate_legacy_migration_integrity.sql
```

Para reimportar el JSON sin recrear todo el esquema:

```sql
@rollback/R002__rollback_latest_migration_batch.sql
@import/run_import_tablero_2026_05_19.sql
```

Para reiniciar todo el esquema local:

```sql
@rollback/R001__drop_all_objects.sql
@run_all_migrations.sql
@import/run_import_tablero_2026_05_19.sql
```

## Entregables

- `sql/oracle/migration/V010__legacy_json_migration_package.sql`: package de migracion, parsing JSON, carga normalizada, logging y rollback por batch.
- `sql/oracle/migration/V012__local_admin_seed.sql`: seed admin local idempotente con BCrypt y RBAC completo.
- `sql/oracle/import/run_import_tablero_2026_05_19.sql`: script real de carga del JSON actual por chunks CLOB.
- `sql/oracle/validation/validate_legacy_migration_counts.sql`: conteos esperados del backup actual.
- `sql/oracle/validation/validate_legacy_migration_integrity.sql`: validaciones dinamicas contra staging, mapas, FK, duplicados, errores y admin.
- `sql/oracle/rollback/R002__rollback_latest_migration_batch.sql`: rollback del ultimo batch de migracion.

## Criterios de aceptacion

- `migration_batch.status = COMPLETED`.
- `migration_error` sin registros para el batch.
- Conteos JSON y conteos Oracle coinciden.
- Consultas de integridad reportan `issue_count = 0`.
- `legacy_id_map` contiene equivalencias para entidades migradas.
- `project_update` queda poblada sin sobrescritura de historicos.
- Login local con `admin` / `admin123` funciona contra el backend.
