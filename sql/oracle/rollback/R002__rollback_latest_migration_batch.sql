-- ============================================================================
-- R002__rollback_latest_migration_batch.sql
-- Oracle 19c - Roll back the latest JSON migration batch only
--
-- Prerequisites:
--   - V006 (migration_batch tables) applied
--   - V010 (pkg_legacy_json_migration) compiled and VALID
--
-- Preserves schema, catalogs, RBAC seed data and the local admin user.
-- Use before re-importing the same legacy JSON in local/dev.
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

SET SERVEROUTPUT ON;

DECLARE
  v_batch_id        NUMBER(19, 0);
  v_table_exists    NUMBER;
  v_package_valid   NUMBER;
  e_missing_prereq  EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_missing_prereq, -20901);
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'MIGRATION_BATCH';

  IF v_table_exists = 0 THEN
    RAISE_APPLICATION_ERROR(
      -20901,
      'MIGRATION_BATCH no existe. Ejecute migraciones V001-V010 antes de R002, o use R001 para teardown completo.'
    );
  END IF;

  SELECT COUNT(*)
  INTO v_package_valid
  FROM user_objects
  WHERE object_name = 'PKG_LEGACY_JSON_MIGRATION'
    AND object_type = 'PACKAGE BODY'
    AND status = 'VALID';

  IF v_package_valid = 0 THEN
    RAISE_APPLICATION_ERROR(
      -20901,
      'PKG_LEGACY_JSON_MIGRATION no está compilado. Ejecute V010 antes de R002.'
    );
  END IF;

  BEGIN
    SELECT MAX(migration_batch_id)
    INTO v_batch_id
    FROM migration_batch;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      v_batch_id := NULL;
  END;

  IF v_batch_id IS NULL THEN
    DBMS_OUTPUT.PUT_LINE('No migration batch found. Nothing to rollback.');
  ELSE
    pkg_legacy_json_migration.rollback_batch(v_batch_id);
    DBMS_OUTPUT.PUT_LINE('Rolled back migration batch id: ' || v_batch_id);
  END IF;
END;
/

PROMPT R002 completed.
