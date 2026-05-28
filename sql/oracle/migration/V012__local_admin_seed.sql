-- ============================================================================
-- V012__local_admin_seed.sql
-- Oracle 19c - Local/dev administrator seed for backend authentication tests
--
-- Temporary local credentials:
--   username: admin
--   password: admin123
--
-- The password_hash value is BCrypt generated with Spring Security
-- BCryptPasswordEncoder and is compatible with the Spring Boot backend.
-- Replace this user/password before any production-like deployment.
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

DECLARE
  v_admin_user_id NUMBER(19, 0);
  v_admin_role_id NUMBER(19, 0);
  v_user_role_count NUMBER;
BEGIN
  BEGIN
    SELECT user_id
    INTO v_admin_user_id
    FROM app_user
    WHERE username = 'admin';
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      SELECT seq_app_user.NEXTVAL INTO v_admin_user_id FROM dual;

      INSERT INTO app_user (
        user_id, username, email, password_hash, full_name, active,
        created_at, updated_at, is_deleted
      ) VALUES (
        v_admin_user_id,
        'admin',
        'analyruiz@coltefinanciera.com.co',
        '$2a$10$/huIvLDZ5xFix4W9lb/qsuQltsTitZEeyip222WfMZ97lHXZmFvWa',
        'Analy Ruiz',
        'Y',
        SYSTIMESTAMP,
        SYSTIMESTAMP,
        'N'
      );
  END;

  UPDATE app_user
  SET active = 'Y',
      is_deleted = 'N',
      deleted_at = NULL,
      deleted_by = NULL,
      updated_at = SYSTIMESTAMP
  WHERE user_id = v_admin_user_id;

  SELECT role_id
  INTO v_admin_role_id
  FROM role
  WHERE code = 'ADMIN'
    AND is_deleted = 'N';

  SELECT COUNT(*)
  INTO v_user_role_count
  FROM user_role
  WHERE user_id = v_admin_user_id
    AND role_id = v_admin_role_id;

  IF v_user_role_count = 0 THEN
    INSERT INTO user_role (
      user_role_id, user_id, role_id, created_at, updated_at, is_deleted
    ) VALUES (
      seq_user_role.NEXTVAL, v_admin_user_id, v_admin_role_id,
      SYSTIMESTAMP, SYSTIMESTAMP, 'N'
    );
  ELSE
    UPDATE user_role
    SET is_deleted = 'N',
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = SYSTIMESTAMP
    WHERE user_id = v_admin_user_id
      AND role_id = v_admin_role_id;
  END IF;

  INSERT INTO role_permission (role_permission_id, role_id, permission_id)
  SELECT seq_role_permission.NEXTVAL, v_admin_role_id, p.permission_id
  FROM permission p
  WHERE p.active = 'Y'
    AND p.is_deleted = 'N'
    AND NOT EXISTS (
      SELECT 1
      FROM role_permission rp
      WHERE rp.role_id = v_admin_role_id
        AND rp.permission_id = p.permission_id
    );

  UPDATE role_permission
  SET is_deleted = 'N',
      deleted_at = NULL,
      deleted_by = NULL,
      updated_at = SYSTIMESTAMP
  WHERE role_id = v_admin_role_id;

  COMMIT;
END;
/

PROMPT Local admin seed validated:

SELECT u.username, u.active, u.is_deleted, r.code AS role_code, COUNT(p.permission_id) AS permission_count
FROM app_user u
JOIN user_role ur ON ur.user_id = u.user_id AND ur.is_deleted = 'N'
JOIN role r ON r.role_id = ur.role_id AND r.is_deleted = 'N'
JOIN role_permission rp ON rp.role_id = r.role_id AND rp.is_deleted = 'N'
JOIN permission p ON p.permission_id = rp.permission_id AND p.is_deleted = 'N'
WHERE u.username = 'admin'
GROUP BY u.username, u.active, u.is_deleted, r.code;
