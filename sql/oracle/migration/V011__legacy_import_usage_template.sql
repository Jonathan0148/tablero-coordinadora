-- ============================================================================
-- V011__legacy_import_usage_template.sql
-- Oracle 19c - Template to stage and import a legacy JSON backup
--
-- This file is intentionally a template. Replace the CLOB assignment with the
-- content of tablero_IT_respaldo_2026-05-19.json or load the CLOB from your
-- preferred client/tool before calling the package.
--
-- For the current real backup, use:
--   @sql/oracle/import/run_import_tablero_2026_05_19.sql
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

DECLARE
  v_batch_id NUMBER(19,0);
  v_stg_id   NUMBER(19,0);
  v_json     CLOB;
BEGIN
  -- Replace this assignment in local execution.
  -- For large files, load v_json via SQL Developer, SQLcl, application code,
  -- or DBMS_LOB.APPEND chunks.
  v_json := TO_CLOB('{"version":"3.0","kanban":[],"logs":[],"projects":[],"teamMembers":[],"projectAssignments":[],"projectUpdates":[],"okrs":[]}');

  SELECT seq_migration_batch.NEXTVAL INTO v_batch_id FROM dual;
  INSERT INTO migration_batch (
    migration_batch_id, source_file_name, source_version, status,
    total_records, success_records, error_records
  ) VALUES (
    v_batch_id, 'tablero_IT_respaldo_2026-05-19.json', '3.0', 'PENDING',
    0, 0, 0
  );

  SELECT seq_stg_legacy_backup.NEXTVAL INTO v_stg_id FROM dual;
  INSERT INTO stg_legacy_backup (
    stg_legacy_backup_id, migration_batch_id, source_file_name, raw_json
  ) VALUES (
    v_stg_id, v_batch_id, 'tablero_IT_respaldo_2026-05-19.json', v_json
  );

  pkg_legacy_json_migration.import_backup(v_stg_id);
END;
/
