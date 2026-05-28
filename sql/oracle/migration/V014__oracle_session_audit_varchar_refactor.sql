-- ============================================================================
-- V014__oracle_session_audit_varchar_refactor.sql
-- Oracle 19c - Real DB-session audit using SYS_CONTEXT('USERENV','SESSION_USER')
--
-- This migration intentionally removes APP_USER-based audit resolution.
-- created_by / updated_by / deleted_by store the Oracle session user directly.
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

DECLARE
  PROCEDURE exec_ignore(p_sql IN VARCHAR2) IS
  BEGIN
    EXECUTE IMMEDIATE p_sql;
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLCODE NOT IN (-942, -4043, -4080, -2443, -2289) THEN
        RAISE;
      END IF;
  END exec_ignore;
BEGIN
  FOR r IN (
    SELECT trigger_name
    FROM user_triggers
    WHERE trigger_name LIKE 'TRG\_%\_AUDIT\_BIU' ESCAPE '\'
  ) LOOP
    exec_ignore('DROP TRIGGER ' || r.trigger_name);
  END LOOP;

  exec_ignore('DROP PACKAGE pkg_oracle_audit');
  exec_ignore('DROP TABLE oracle_audit_principal CASCADE CONSTRAINTS PURGE');
END;
/

DECLARE
  PROCEDURE drop_audit_fks IS
  BEGIN
    FOR r IN (
      SELECT DISTINCT uc.table_name, uc.constraint_name
      FROM user_constraints uc
      JOIN user_cons_columns ucc
        ON ucc.constraint_name = uc.constraint_name
       AND ucc.owner = uc.owner
      WHERE uc.constraint_type = 'R'
        AND ucc.column_name IN ('CREATED_BY', 'UPDATED_BY', 'DELETED_BY')
    ) LOOP
      EXECUTE IMMEDIATE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT ' || r.constraint_name;
    END LOOP;
  END drop_audit_fks;

  PROCEDURE convert_column(p_table_name IN VARCHAR2, p_column_name IN VARCHAR2) IS
    v_data_type user_tab_columns.data_type%TYPE;
    v_exists NUMBER;
    v_tmp_column VARCHAR2(128 CHAR);
  BEGIN
    SELECT COUNT(*)
    INTO v_exists
    FROM user_tab_columns
    WHERE table_name = UPPER(p_table_name)
      AND column_name = UPPER(p_column_name);

    IF v_exists = 0 THEN
      RETURN;
    END IF;

    SELECT data_type
    INTO v_data_type
    FROM user_tab_columns
    WHERE table_name = UPPER(p_table_name)
      AND column_name = UPPER(p_column_name);

    IF v_data_type = 'VARCHAR2' THEN
      EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table_name || ' MODIFY (' || p_column_name || ' VARCHAR2(128 CHAR))';
      RETURN;
    END IF;

    v_tmp_column := p_column_name || '_TXT';

    EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table_name || ' ADD (' || v_tmp_column || ' VARCHAR2(128 CHAR))';
    EXECUTE IMMEDIATE
      'UPDATE ' || p_table_name || ' t ' ||
      'SET ' || v_tmp_column || ' = (' ||
      '  SELECT u.username FROM app_user u WHERE u.user_id = t.' || p_column_name ||
      ') ' ||
      'WHERE t.' || p_column_name || ' IS NOT NULL ' ||
      'AND EXISTS (SELECT 1 FROM app_user u WHERE u.user_id = t.' || p_column_name || ')';
    EXECUTE IMMEDIATE
      'UPDATE ' || p_table_name || ' SET ' || v_tmp_column || ' = TO_CHAR(' || p_column_name || ') ' ||
      'WHERE ' || p_column_name || ' IS NOT NULL AND ' || v_tmp_column || ' IS NULL';
    EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table_name || ' DROP COLUMN ' || p_column_name;
    EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table_name || ' RENAME COLUMN ' || v_tmp_column || ' TO ' || p_column_name;
  END convert_column;

  PROCEDURE convert_table(p_table_name IN VARCHAR2) IS
  BEGIN
    convert_column(p_table_name, 'CREATED_BY');
    convert_column(p_table_name, 'UPDATED_BY');
    convert_column(p_table_name, 'DELETED_BY');
  END convert_table;
BEGIN
  drop_audit_fks;

  convert_table('APP_USER');
  convert_table('ROLE');
  convert_table('PERMISSION');
  convert_table('USER_ROLE');
  convert_table('ROLE_PERMISSION');
  convert_table('AUTH_REFRESH_TOKEN');

  convert_table('PIPELINE_STATUS');
  convert_table('EXECUTIVE_STATUS');
  convert_table('TRAFFIC_LIGHT');
  convert_table('WORK_AREA');
  convert_table('KANBAN_STATUS');
  convert_table('PRIORITY_LEVEL');
  convert_table('STOPPER_IMPACT');
  convert_table('RESPONSIBLE_AREA');
  convert_table('TECH_ROLE');
  convert_table('OKR_ACTIVITY_STATUS');

  convert_table('PROJECT');
  convert_table('TEAM_MEMBER');
  convert_table('PROJECT_ASSIGNMENT');
  convert_table('PROJECT_UPDATE');
  convert_table('KANBAN_CARD');
  convert_table('NOTIFICATION_REMINDER');
  convert_table('ACTIVITY_LOG');
  convert_table('OKR');
  convert_table('OKR_ACTIVITY');
  convert_table('OKR_ACTIVITY_MILESTONE');

  convert_table('MIGRATION_BATCH');
  convert_table('LEGACY_ID_MAP');
END;
/

DECLARE
  PROCEDURE create_audit_trigger(p_table_name IN VARCHAR2) IS
    v_trigger_name VARCHAR2(128 CHAR);
  BEGIN
    v_trigger_name := 'trg_' || LOWER(p_table_name) || '_audit_biu';

    EXECUTE IMMEDIATE
      'CREATE OR REPLACE TRIGGER ' || v_trigger_name || CHR(10) ||
      'BEFORE INSERT OR UPDATE ON ' || LOWER(p_table_name) || CHR(10) ||
      'FOR EACH ROW' || CHR(10) ||
      'DECLARE' || CHR(10) ||
      '  v_session_user VARCHAR2(128 CHAR);' || CHR(10) ||
      'BEGIN' || CHR(10) ||
      '  v_session_user := SYS_CONTEXT(''USERENV'', ''SESSION_USER'');' || CHR(10) ||
      '  IF INSERTING THEN' || CHR(10) ||
      '    IF :NEW.created_at IS NULL THEN' || CHR(10) ||
      '      :NEW.created_at := SYSTIMESTAMP;' || CHR(10) ||
      '    END IF;' || CHR(10) ||
      '    IF :NEW.updated_at IS NULL THEN' || CHR(10) ||
      '      :NEW.updated_at := :NEW.created_at;' || CHR(10) ||
      '    END IF;' || CHR(10) ||
      '    IF :NEW.created_by IS NULL THEN' || CHR(10) ||
      '      :NEW.created_by := v_session_user;' || CHR(10) ||
      '    END IF;' || CHR(10) ||
      '    IF :NEW.updated_by IS NULL THEN' || CHR(10) ||
      '      :NEW.updated_by := NVL(:NEW.created_by, v_session_user);' || CHR(10) ||
      '    END IF;' || CHR(10) ||
      '  ELSE' || CHR(10) ||
      '    :NEW.created_at := :OLD.created_at;' || CHR(10) ||
      '    :NEW.created_by := :OLD.created_by;' || CHR(10) ||
      '    :NEW.updated_at := SYSTIMESTAMP;' || CHR(10) ||
      '    :NEW.updated_by := v_session_user;' || CHR(10) ||
      '    IF :OLD.is_deleted = ''N'' AND :NEW.is_deleted = ''Y'' THEN' || CHR(10) ||
      '      IF :NEW.deleted_at IS NULL THEN' || CHR(10) ||
      '        :NEW.deleted_at := SYSTIMESTAMP;' || CHR(10) ||
      '      END IF;' || CHR(10) ||
      '      IF :NEW.deleted_by IS NULL THEN' || CHR(10) ||
      '        :NEW.deleted_by := v_session_user;' || CHR(10) ||
      '      END IF;' || CHR(10) ||
      '    END IF;' || CHR(10) ||
      '  END IF;' || CHR(10) ||
      'END;';
  END create_audit_trigger;
BEGIN
  create_audit_trigger('APP_USER');
  create_audit_trigger('ROLE');
  create_audit_trigger('PERMISSION');
  create_audit_trigger('USER_ROLE');
  create_audit_trigger('ROLE_PERMISSION');
  create_audit_trigger('AUTH_REFRESH_TOKEN');

  create_audit_trigger('PIPELINE_STATUS');
  create_audit_trigger('EXECUTIVE_STATUS');
  create_audit_trigger('TRAFFIC_LIGHT');
  create_audit_trigger('WORK_AREA');
  create_audit_trigger('KANBAN_STATUS');
  create_audit_trigger('PRIORITY_LEVEL');
  create_audit_trigger('STOPPER_IMPACT');
  create_audit_trigger('RESPONSIBLE_AREA');
  create_audit_trigger('TECH_ROLE');
  create_audit_trigger('OKR_ACTIVITY_STATUS');

  create_audit_trigger('PROJECT');
  create_audit_trigger('TEAM_MEMBER');
  create_audit_trigger('PROJECT_ASSIGNMENT');
  create_audit_trigger('PROJECT_UPDATE');
  create_audit_trigger('KANBAN_CARD');
  create_audit_trigger('NOTIFICATION_REMINDER');
  create_audit_trigger('ACTIVITY_LOG');
  create_audit_trigger('OKR');
  create_audit_trigger('OKR_ACTIVITY');
  create_audit_trigger('OKR_ACTIVITY_MILESTONE');

  create_audit_trigger('MIGRATION_BATCH');
  create_audit_trigger('LEGACY_ID_MAP');
END;
/

DECLARE
  v_error_count NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_error_count
  FROM user_errors
  WHERE name LIKE 'TRG\_%\_AUDIT\_BIU' ESCAPE '\';

  IF v_error_count > 0 THEN
    RAISE_APPLICATION_ERROR(-20998, 'Oracle session audit triggers have compilation errors. Query USER_ERRORS for details.');
  END IF;
END;
/

DELETE FROM app_user u
WHERE u.username = SYS_CONTEXT('USERENV', 'SESSION_USER')
  AND u.email = LOWER(SYS_CONTEXT('USERENV', 'SESSION_USER')) || '@db-session.local'
  AND u.full_name = 'Usuario tecnico Oracle ' || SYS_CONTEXT('USERENV', 'SESSION_USER')
  AND u.active = 'N'
  AND NOT EXISTS (SELECT 1 FROM user_role ur WHERE ur.user_id = u.user_id);

COMMIT;
