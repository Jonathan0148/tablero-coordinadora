# FASE 4 - Hardening Oracle 19c

## Objetivo

Corregir problemas reales detectados durante ejecucion contra Oracle 19c sin cambiar arquitectura, modelo relacional, bounded contexts ni nombres funcionales legacy.

## Cambios aplicados

### 1. Indices redundantes

Archivo revisado:

- `sql/oracle/migration/V008__indexes.sql`

Se confirmo que Oracle crea indices implicitos para constraints `PRIMARY KEY` y `UNIQUE`.

Indices redundantes evitados:

- `project_update(legacy_id)` ya esta cubierto por `uk_project_update__legacy_id`.
- `activity_log(legacy_id)` ya esta cubierto por `uk_activity_log__legacy_id`.

Ambos quedaron comentados para trazabilidad y no se ejecutan.

### 2. Package de migracion JSON

Archivo endurecido:

- `sql/oracle/migration/V010__legacy_json_migration_package.sql`

Cambios:

- Se eliminaron llamadas a helpers privados dentro de SQL estatico.
- Se removieron helpers problematicos:
  - `to_tstz`
  - `to_date_yyyy_mm_dd`
  - `yn`
- Se reemplazaron por expresiones Oracle nativas:
  - `TO_DATE(...)`
  - `TO_TIMESTAMP_TZ(...)`
  - `FROM_TZ(...)`
  - `CASE WHEN ... THEN 'Y' ELSE 'N' END`
- Se reemplazaron inicializaciones PL/SQL incompatibles tipo `v_id := seq_x.NEXTVAL`.
- Ahora todas las secuencias en PL/SQL se obtienen con:

```sql
SELECT seq_x.NEXTVAL INTO v_id FROM dual;
```

- Se centralizo el registro de errores en `log_error(...)`.
- Se evita usar `SQLCODE` directamente dentro de SQL estatico.
- Se agrego validacion final contra `USER_ERRORS` para fallar la migracion si el package queda invalido.

### 3. Trigger append-only

Archivo endurecido:

- `sql/oracle/migration/V009__views_and_append_only_triggers.sql`

Cambios:

- El trigger `trg_project_update_append_only` ahora usa `UPDATING('COLUMN')`.
- Esto bloquea actualizaciones de columnas funcionales incluyendo CLOBs.
- Se evita comparar CLOBs directamente.
- Se mantiene permitido solo soft delete administrativo controlado.

Columnas funcionales protegidas:

- `PROJECT_ID`
- `LEGACY_ID`
- `UPDATED_AT_ORIGINAL`
- `EXECUTIVE_STATUS_ID`
- `TRAFFIC_LIGHT_ID`
- `SUMMARY`
- `PENDING_ITEMS`
- `HAS_STOPPER`
- `STOPPER_DESC`
- `STOPPER_OWNER`
- `STOPPER_IMPACT_ID`
- `RELEVANT_RISKS`
- `NEXT_MILESTONE`
- `NEXT_MILESTONE_DATE`
- `PENDING_DECISIONS`
- `REQUIRES_COORDINATION`
- `COORDINATION_DESC`
- `RESPONSIBLE_AREA_ID`
- `RESPONSIBLE_ACTION`
- `ADDITIONAL_NOTES`

### 4. Template de importacion

Archivo corregido:

- `sql/oracle/migration/V011__legacy_import_usage_template.sql`

Cambios:

- Se reemplazo `v_batch_id := seq_migration_batch.NEXTVAL`.
- Se reemplazo `v_stg_id := seq_stg_legacy_backup.NEXTVAL`.
- Ahora usa `SELECT ... NEXTVAL INTO ... FROM dual`.

## Archivos modificados

- `sql/oracle/migration/V008__indexes.sql`
- `sql/oracle/migration/V009__views_and_append_only_triggers.sql`
- `sql/oracle/migration/V010__legacy_json_migration_package.sql`
- `sql/oracle/migration/V011__legacy_import_usage_template.sql`

## Flujo recomendado para reejecucion limpia

Desde `sql/oracle`:

```sql
@rollback/R001__drop_all_objects.sql
@run_all_migrations.sql
```

Luego validar:

```sql
@validation/validate_legacy_migration_counts.sql
@validation/validate_dashboard_queries.sql
```

## Resultado esperado

- Sin ORA-01408 por indices redundantes de `legacy_id`.
- Sin PLS-00231 por helpers privados usados desde SQL.
- Sin ORA-00984 por `seq.NEXTVAL` usado como expresion PL/SQL directa.
- Trigger append-only compatible con CLOBs.
- Package de migracion compilable y verificable con `USER_ERRORS`.
