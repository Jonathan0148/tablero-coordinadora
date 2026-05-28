-- ============================================================================
-- R003__rollback_v004_seed_data.sql
-- Oracle 19c - Reverse V004__catalog_seed_data.sql
--
-- Removes catalog + RBAC seed rows inserted by V004.
-- Does NOT drop tables (use R001 for schema teardown).
--
-- WARNING:
--   Fails if business rows still reference catalog/RBAC seed data.
--   Run R002 first to remove imported legacy business data.
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

SET SERVEROUTPUT ON;

DECLARE
  v_role_exists NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_role_exists FROM user_tables WHERE table_name = 'ROLE';
  IF v_role_exists = 0 THEN
    RAISE_APPLICATION_ERROR(-20902, 'Tablas RBAC no existen. Nada que revertir en R003.');
  END IF;

  -- Bridge tables first (FK-safe order)
  DELETE FROM auth_refresh_token
  WHERE user_id IN (SELECT user_id FROM app_user WHERE username = 'admin');

  DELETE FROM user_role
  WHERE user_id IN (SELECT user_id FROM app_user WHERE username = 'admin')
     OR role_id IN (SELECT role_id FROM role WHERE code IN ('ADMIN', 'COORDINATOR', 'TECH_LEAD', 'EXECUTIVE', 'VIEWER'));

  DELETE FROM app_user WHERE username = 'admin';

  DELETE FROM permission
  WHERE code IN (
    'projects:read', 'projects:create', 'projects:update', 'projects:delete',
    'project-updates:read', 'project-updates:create', 'project-updates:delete',
    'kanban:read', 'kanban:create', 'kanban:update', 'kanban:delete',
    'teams:read', 'teams:create', 'teams:update', 'teams:delete',
    'assignments:read', 'assignments:create', 'assignments:update', 'assignments:delete',
    'okrs:read', 'okrs:update',
    'logs:read', 'logs:create', 'logs:delete',
    'committee:read', 'reports:read', 'migration:execute', 'security:admin', 'catalogs:admin'
  );

  DELETE FROM role_permission
  WHERE role_id IN (SELECT role_id FROM role WHERE code IN ('ADMIN', 'COORDINATOR', 'TECH_LEAD', 'EXECUTIVE', 'VIEWER'));

  DELETE FROM role
  WHERE code IN ('ADMIN', 'COORDINATOR', 'TECH_LEAD', 'EXECUTIVE', 'VIEWER');

  DELETE FROM okr_activity_status
  WHERE code IN ('PENDIENTE', 'EN_CURSO', 'COMPLETADO', 'BLOQUEADO');

  DELETE FROM tech_role
  WHERE code IN (
    'LIDER_TECNICO', 'BE_JAVA', 'BE_BASE_DATOS', 'BE_DATA_SCIENCE',
    'FRONTEND', 'DOT_NET', 'QA', 'DEVOPS', 'OTRO'
  );

  DELETE FROM responsible_area
  WHERE code IN ('COORDINACION', 'DIRECCION', 'GERENCIA', 'DELIVERY_MANAGER', 'PRODUCT_DELIVERY', 'FUNCIONAL');

  DELETE FROM stopper_impact
  WHERE code IN ('BAJO', 'MEDIO', 'ALTO', 'CRITICO');

  DELETE FROM priority_level
  WHERE code IN ('ALTA', 'MEDIA', 'BAJA');

  DELETE FROM kanban_status
  WHERE code IN ('PENDIENTE', 'EN_CURSO', 'HECHO');

  DELETE FROM work_area
  WHERE code IN ('PLAN', 'EXEC', 'STAKE', 'TRANS', 'CIERRE', 'COTIDIANA', 'SEGUIMIENTO');

  DELETE FROM traffic_light
  WHERE code IN ('GRIS', 'VERDE', 'AMARILLO', 'ROJO');

  DELETE FROM executive_status
  WHERE code IN ('EN_CURSO', 'EN_RIESGO', 'BLOQUEADO', 'REQUIERE_DECISION', 'COMPLETADO');

  DELETE FROM pipeline_status
  WHERE code IN (
    'DESARROLLO', 'PLANEACION', 'REVISION', 'RECEPCION_HUS',
    'CERTIFICACION', 'PAUSADO', 'FINALIZADO', 'SIN_INFORMACION'
  );

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('R003: V004 seed data removed.');
END;
/
