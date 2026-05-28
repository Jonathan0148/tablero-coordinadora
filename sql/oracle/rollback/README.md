# Oracle Rollback Scripts

Scripts de rollback alineados con `sql/oracle/migration/V*.sql`.

## Mapa migrate ↔ rollback

| Migrate | Descripción | Rollback |
|---------|-------------|----------|
| V001–V011 | Schema base | R001 (teardown completo) |
| V004 | Seed catálogos + RBAC | R003 |
| V010 + import | Datos legacy JSON | R002 |
| V012 | Usuario admin local | R004 |
| V013–V014 | Auditoría sesión Oracle | R001 |

## Orden recomendado (reimportar JSON)

Ejecutar desde `sql/oracle` como `APP_CURSOR`:

```sql
@rollback/R002__rollback_latest_migration_batch.sql
@import/run_import_tablero_2026_05_19.sql
```

## Orden recomendado (reset local completo)

```sql
@rollback/R001__drop_all_objects.sql
@run_all_migrations.sql
@import/run_import_tablero_2026_05_19.sql
```

## Orden recomendado (revertir solo seeds)

```sql
@rollback/R002__rollback_latest_migration_batch.sql
@rollback/R004__rollback_v012_local_admin.sql
@rollback/R003__rollback_v004_seed_data.sql
```

## Causa común de error PLS-00201 en R002

El error `PLS-00201: identifier 'MIGRATION_BATCH.MIGRATION_BATCH_ID' must be declared`
ocurre cuando el bloque PL/SQL usa `%TYPE` sobre una tabla que **aún no existe**
(o ya fue eliminada por R001).

R002 corregido usa `NUMBER(19,0)` explícito y valida prerrequisitos antes de ejecutar.

## Validación post-rollback

```sql
@validation/validate_legacy_migration_counts.sql
@validation/validate_dashboard_queries.sql
```
