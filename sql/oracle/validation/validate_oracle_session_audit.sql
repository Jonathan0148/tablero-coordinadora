-- ============================================================================
-- validate_oracle_session_audit.sql
-- Oracle 19c - Validate DB session audit triggers
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

SET SERVEROUTPUT ON;

DECLARE
  v_project_id project.project_id%TYPE;
  v_status_id pipeline_status.pipeline_status_id%TYPE;
  v_created_by project.created_by%TYPE;
  v_updated_by project.updated_by%TYPE;
BEGIN
  SELECT pipeline_status_id
  INTO v_status_id
  FROM pipeline_status
  WHERE ROWNUM = 1;

  SELECT seq_project.NEXTVAL INTO v_project_id FROM dual;

  INSERT INTO project (
    project_id, legacy_id, name, pipeline_status_id, start_date, is_ghost
  ) VALUES (
    v_project_id,
    'AUDIT_TEST_' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISSFF3'),
    'Audit trigger validation',
    v_status_id,
    TRUNC(SYSDATE),
    'N'
  );

  SELECT p.created_by
  INTO v_created_by
  FROM project p
  WHERE p.project_id = v_project_id;

  IF v_created_by IS NULL OR v_created_by <> SYS_CONTEXT('USERENV', 'SESSION_USER') THEN
    RAISE_APPLICATION_ERROR(-20997, 'created_by was not populated directly from Oracle session user.');
  END IF;

  UPDATE project
  SET name = 'Audit trigger validation updated'
  WHERE project_id = v_project_id;

  SELECT p.updated_by
  INTO v_updated_by
  FROM project p
  WHERE p.project_id = v_project_id;

  IF v_updated_by IS NULL OR v_updated_by <> SYS_CONTEXT('USERENV', 'SESSION_USER') THEN
    RAISE_APPLICATION_ERROR(-20996, 'updated_by was not populated directly from Oracle session user.');
  END IF;

  DELETE FROM project WHERE project_id = v_project_id;
  COMMIT;

  DBMS_OUTPUT.PUT_LINE('Oracle session audit validation OK for ' || SYS_CONTEXT('USERENV', 'SESSION_USER'));
  DBMS_OUTPUT.PUT_LINE('SESSION_USER -> created_by: ' || SYS_CONTEXT('USERENV', 'SESSION_USER') || ' -> ' || v_created_by);
  DBMS_OUTPUT.PUT_LINE('SESSION_USER -> updated_by: ' || SYS_CONTEXT('USERENV', 'SESSION_USER') || ' -> ' || v_updated_by);
END;
/

SELECT t.trigger_name, t.status
FROM user_triggers t
WHERE t.trigger_name LIKE 'TRG\_%\_AUDIT\_BIU' ESCAPE '\'
ORDER BY t.trigger_name;

SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS session_user
FROM dual;
