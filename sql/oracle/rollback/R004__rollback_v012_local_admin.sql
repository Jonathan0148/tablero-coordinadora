-- ============================================================================
-- R004__rollback_v012_local_admin.sql
-- Oracle 19c - Reverse V012__local_admin_seed.sql
--
-- Removes local admin user (username=admin) and its role links.
-- Does NOT remove ADMIN role or permissions (those come from V004).
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

SET SERVEROUTPUT ON;

DECLARE
  v_admin_user_id NUMBER(19, 0);
BEGIN
  BEGIN
    SELECT user_id
    INTO v_admin_user_id
    FROM app_user
    WHERE username = 'admin'
      AND is_deleted = 'N';
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      DBMS_OUTPUT.PUT_LINE('R004: local admin user not found. Nothing to rollback.');
      RETURN;
  END;

  DELETE FROM auth_refresh_token WHERE user_id = v_admin_user_id;
  DELETE FROM user_role WHERE user_id = v_admin_user_id;
  DELETE FROM app_user WHERE user_id = v_admin_user_id;

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('R004: local admin seed removed (user_id=' || v_admin_user_id || ').');
END;
/
