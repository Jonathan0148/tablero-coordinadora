-- ============================================================================
-- R002__rollback_latest_migration_batch.sql
-- Oracle 19c - Roll back the latest JSON migration batch only
--
-- This preserves schema, catalogs, RBAC seed data and the local admin user.
-- Use this before re-importing the same legacy JSON in local/dev.
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

SET SERVEROUTPUT ON;

DECLARE
  v_batch_id migration_batch.migration_batch_id%TYPE;
BEGIN
  SELECT MAX(migration_batch_id)
  INTO v_batch_id
  FROM migration_batch;

  IF v_batch_id IS NULL THEN
    DBMS_OUTPUT.PUT_LINE('No migration batch found. Nothing to rollback.');
  ELSE
    pkg_legacy_json_migration.rollback_batch(v_batch_id);
    DBMS_OUTPUT.PUT_LINE('Rolled back migration batch id: ' || v_batch_id);
  END IF;
END;
/
