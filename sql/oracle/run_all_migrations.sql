-- ============================================================================
-- run_all_migrations.sql
-- Oracle 19c - Local execution helper
-- Run from sql/oracle directory with SQL*Plus or SQLcl:
--   @run_all_migrations.sql
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

@migration/V001__sequences.sql
@migration/V002__security_rbac_tables.sql
@migration/V003__catalog_tables.sql
@migration/V004__catalog_seed_data.sql
@migration/V005__business_tables.sql
@migration/V006__migration_audit_tables.sql
@migration/V007__foreign_keys.sql
@migration/V008__indexes.sql
@migration/V009__views_and_append_only_triggers.sql
@migration/V010__legacy_json_migration_package.sql
@migration/V012__local_admin_seed.sql
@migration/V013__oracle_session_audit_triggers.sql
@migration/V014__oracle_session_audit_varchar_refactor.sql

PROMPT Oracle enterprise schema created successfully.
