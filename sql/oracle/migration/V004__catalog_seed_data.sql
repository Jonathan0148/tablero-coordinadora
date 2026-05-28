-- ============================================================================
-- V004__catalog_seed_data.sql
-- Oracle 19c - Initial catalog and RBAC seed data
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

BEGIN
  INSERT INTO pipeline_status VALUES (seq_pipeline_status.NEXTVAL, 'DESARROLLO', 'Desarrollo', NULL, 10, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO pipeline_status VALUES (seq_pipeline_status.NEXTVAL, 'PLANEACION', 'Planeación', NULL, 20, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO pipeline_status VALUES (seq_pipeline_status.NEXTVAL, 'REVISION', 'Revisión', NULL, 30, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO pipeline_status VALUES (seq_pipeline_status.NEXTVAL, 'RECEPCION_HUS', 'Recepción Hus', NULL, 40, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO pipeline_status VALUES (seq_pipeline_status.NEXTVAL, 'CERTIFICACION', 'Certificación', NULL, 50, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO pipeline_status VALUES (seq_pipeline_status.NEXTVAL, 'PAUSADO', 'Pausado', NULL, 60, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO pipeline_status VALUES (seq_pipeline_status.NEXTVAL, 'FINALIZADO', 'Finalizado', NULL, 70, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO pipeline_status VALUES (seq_pipeline_status.NEXTVAL, 'SIN_INFORMACION', 'Sin información', NULL, 80, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);

  INSERT INTO executive_status VALUES (seq_executive_status.NEXTVAL, 'EN_CURSO', 'En curso', NULL, 10, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO executive_status VALUES (seq_executive_status.NEXTVAL, 'EN_RIESGO', 'En riesgo', NULL, 20, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO executive_status VALUES (seq_executive_status.NEXTVAL, 'BLOQUEADO', 'Bloqueado', NULL, 30, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO executive_status VALUES (seq_executive_status.NEXTVAL, 'REQUIERE_DECISION', 'Requiere decisión', NULL, 40, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO executive_status VALUES (seq_executive_status.NEXTVAL, 'COMPLETADO', 'Completado', NULL, 50, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);

  INSERT INTO traffic_light VALUES (seq_traffic_light.NEXTVAL, 'GRIS', 'gris', NULL, 10, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO traffic_light VALUES (seq_traffic_light.NEXTVAL, 'VERDE', 'verde', NULL, 20, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO traffic_light VALUES (seq_traffic_light.NEXTVAL, 'AMARILLO', 'amarillo', NULL, 30, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO traffic_light VALUES (seq_traffic_light.NEXTVAL, 'ROJO', 'rojo', NULL, 40, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);

  INSERT INTO work_area VALUES (seq_work_area.NEXTVAL, 'PLAN', 'plan', 'Planificación', NULL, 10, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO work_area VALUES (seq_work_area.NEXTVAL, 'EXEC', 'exec', 'Ejecución', NULL, 20, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO work_area VALUES (seq_work_area.NEXTVAL, 'STAKE', 'stake', 'Stakeholders', NULL, 30, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO work_area VALUES (seq_work_area.NEXTVAL, 'TRANS', 'trans', 'Transversal', NULL, 40, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO work_area VALUES (seq_work_area.NEXTVAL, 'CIERRE', 'cierre', 'Cierre', NULL, 50, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO work_area VALUES (seq_work_area.NEXTVAL, 'COTIDIANA', 'cotidiana', 'Cotidiana', NULL, 60, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO work_area VALUES (seq_work_area.NEXTVAL, 'SEGUIMIENTO', 'seguimiento', 'Seguimiento', NULL, 70, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);

  INSERT INTO kanban_status VALUES (seq_kanban_status.NEXTVAL, 'PENDIENTE', 'pendiente', 'Pendiente', NULL, 10, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO kanban_status VALUES (seq_kanban_status.NEXTVAL, 'EN_CURSO', 'en-curso', 'En Curso', NULL, 20, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO kanban_status VALUES (seq_kanban_status.NEXTVAL, 'HECHO', 'hecho', 'Hecho', NULL, 30, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);

  INSERT INTO priority_level VALUES (seq_priority_level.NEXTVAL, 'ALTA', 'alta', 'Alta', NULL, 10, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO priority_level VALUES (seq_priority_level.NEXTVAL, 'MEDIA', 'media', 'Media', NULL, 20, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO priority_level VALUES (seq_priority_level.NEXTVAL, 'BAJA', 'baja', 'Baja', NULL, 30, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);

  INSERT INTO stopper_impact VALUES (seq_stopper_impact.NEXTVAL, 'BAJO', 'Bajo', NULL, 10, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO stopper_impact VALUES (seq_stopper_impact.NEXTVAL, 'MEDIO', 'Medio', NULL, 20, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO stopper_impact VALUES (seq_stopper_impact.NEXTVAL, 'ALTO', 'Alto', NULL, 30, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO stopper_impact VALUES (seq_stopper_impact.NEXTVAL, 'CRITICO', 'Crítico', NULL, 40, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);

  INSERT INTO responsible_area VALUES (seq_responsible_area.NEXTVAL, 'COORDINACION', 'Coordinacion', NULL, 10, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO responsible_area VALUES (seq_responsible_area.NEXTVAL, 'DIRECCION', 'Direccion', NULL, 20, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO responsible_area VALUES (seq_responsible_area.NEXTVAL, 'GERENCIA', 'Gerencia', NULL, 30, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO responsible_area VALUES (seq_responsible_area.NEXTVAL, 'DELIVERY_MANAGER', 'Delivery Manager', NULL, 40, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO responsible_area VALUES (seq_responsible_area.NEXTVAL, 'PRODUCT_DELIVERY', 'Product Delivery', NULL, 50, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO responsible_area VALUES (seq_responsible_area.NEXTVAL, 'FUNCIONAL', 'Funcional', NULL, 60, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);

  INSERT INTO tech_role VALUES (seq_tech_role.NEXTVAL, 'LIDER_TECNICO', 'Líder Técnico', NULL, 10, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO tech_role VALUES (seq_tech_role.NEXTVAL, 'BE_JAVA', 'BE Java', NULL, 20, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO tech_role VALUES (seq_tech_role.NEXTVAL, 'BE_BASE_DATOS', 'BE Base de Datos', NULL, 30, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO tech_role VALUES (seq_tech_role.NEXTVAL, 'BE_DATA_SCIENCE', 'BE Data Science', NULL, 40, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO tech_role VALUES (seq_tech_role.NEXTVAL, 'FRONTEND', 'Frontend', NULL, 50, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO tech_role VALUES (seq_tech_role.NEXTVAL, 'DOT_NET', '.Net', NULL, 60, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO tech_role VALUES (seq_tech_role.NEXTVAL, 'QA', 'QA', NULL, 70, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO tech_role VALUES (seq_tech_role.NEXTVAL, 'DEVOPS', 'DevOps', NULL, 80, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO tech_role VALUES (seq_tech_role.NEXTVAL, 'OTRO', 'Otro', NULL, 90, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);

  INSERT INTO okr_activity_status VALUES (seq_okr_activity_status.NEXTVAL, 'PENDIENTE', 'Pendiente', NULL, 10, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO okr_activity_status VALUES (seq_okr_activity_status.NEXTVAL, 'EN_CURSO', 'En curso', NULL, 20, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO okr_activity_status VALUES (seq_okr_activity_status.NEXTVAL, 'COMPLETADO', 'Completado', NULL, 30, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);
  INSERT INTO okr_activity_status VALUES (seq_okr_activity_status.NEXTVAL, 'BLOQUEADO', 'Bloqueado', NULL, 40, 'Y', SYSTIMESTAMP, SYSTIMESTAMP, NULL, NULL, 'N', NULL, NULL);

  INSERT INTO role (role_id, code, name, description) VALUES (seq_role.NEXTVAL, 'ADMIN', 'Administrador', 'Administración total de la plataforma');
  INSERT INTO role (role_id, code, name, description) VALUES (seq_role.NEXTVAL, 'COORDINATOR', 'Coordinador', 'Gestión integral de portafolio y seguimiento');
  INSERT INTO role (role_id, code, name, description) VALUES (seq_role.NEXTVAL, 'TECH_LEAD', 'Líder técnico', 'Gestión de proyectos asignados y actividades');
  INSERT INTO role (role_id, code, name, description) VALUES (seq_role.NEXTVAL, 'EXECUTIVE', 'Ejecutivo', 'Consulta ejecutiva y vista comité');
  INSERT INTO role (role_id, code, name, description) VALUES (seq_role.NEXTVAL, 'VIEWER', 'Consulta', 'Solo lectura');
END;
/

INSERT INTO permission (permission_id, code, module, action, description)
SELECT seq_permission.NEXTVAL, code, module, action, description
FROM (
  SELECT 'projects:read' code, 'projects' module, 'read' action, 'Consultar proyectos' description FROM dual UNION ALL
  SELECT 'projects:create', 'projects', 'create', 'Crear proyectos' FROM dual UNION ALL
  SELECT 'projects:update', 'projects', 'update', 'Actualizar proyectos' FROM dual UNION ALL
  SELECT 'projects:delete', 'projects', 'delete', 'Eliminar proyectos' FROM dual UNION ALL
  SELECT 'project-updates:read', 'project-updates', 'read', 'Consultar actualizaciones' FROM dual UNION ALL
  SELECT 'project-updates:create', 'project-updates', 'create', 'Crear actualizaciones append-only' FROM dual UNION ALL
  SELECT 'project-updates:delete', 'project-updates', 'delete', 'Ocultar actualizaciones administrativamente' FROM dual UNION ALL
  SELECT 'kanban:read', 'kanban', 'read', 'Consultar Kanban' FROM dual UNION ALL
  SELECT 'kanban:create', 'kanban', 'create', 'Crear actividades Kanban' FROM dual UNION ALL
  SELECT 'kanban:update', 'kanban', 'update', 'Actualizar actividades Kanban' FROM dual UNION ALL
  SELECT 'kanban:delete', 'kanban', 'delete', 'Eliminar actividades Kanban' FROM dual UNION ALL
  SELECT 'teams:read', 'teams', 'read', 'Consultar equipos' FROM dual UNION ALL
  SELECT 'teams:create', 'teams', 'create', 'Crear miembros' FROM dual UNION ALL
  SELECT 'teams:update', 'teams', 'update', 'Actualizar miembros' FROM dual UNION ALL
  SELECT 'teams:delete', 'teams', 'delete', 'Eliminar miembros' FROM dual UNION ALL
  SELECT 'assignments:read', 'assignments', 'read', 'Consultar asignaciones' FROM dual UNION ALL
  SELECT 'assignments:create', 'assignments', 'create', 'Crear asignaciones' FROM dual UNION ALL
  SELECT 'assignments:update', 'assignments', 'update', 'Actualizar asignaciones' FROM dual UNION ALL
  SELECT 'assignments:delete', 'assignments', 'delete', 'Eliminar asignaciones' FROM dual UNION ALL
  SELECT 'okrs:read', 'okrs', 'read', 'Consultar OKRs' FROM dual UNION ALL
  SELECT 'okrs:update', 'okrs', 'update', 'Actualizar OKRs' FROM dual UNION ALL
  SELECT 'logs:read', 'logs', 'read', 'Consultar bitácora' FROM dual UNION ALL
  SELECT 'logs:create', 'logs', 'create', 'Crear bitácora' FROM dual UNION ALL
  SELECT 'logs:delete', 'logs', 'delete', 'Eliminar bitácora' FROM dual UNION ALL
  SELECT 'committee:read', 'committee', 'read', 'Consultar vista comité' FROM dual UNION ALL
  SELECT 'reports:read', 'reports', 'read', 'Consultar reportes' FROM dual UNION ALL
  SELECT 'migration:execute', 'migration', 'execute', 'Ejecutar migraciones legacy' FROM dual UNION ALL
  SELECT 'security:admin', 'security', 'admin', 'Administrar seguridad' FROM dual UNION ALL
  SELECT 'catalogs:admin', 'catalogs', 'admin', 'Administrar catálogos' FROM dual
);

INSERT INTO role_permission (role_permission_id, role_id, permission_id)
SELECT seq_role_permission.NEXTVAL, r.role_id, p.permission_id
FROM role r CROSS JOIN permission p
WHERE r.code = 'ADMIN';

INSERT INTO role_permission (role_permission_id, role_id, permission_id)
SELECT seq_role_permission.NEXTVAL, r.role_id, p.permission_id
FROM role r CROSS JOIN permission p
WHERE r.code = 'COORDINATOR'
  AND p.module <> 'security';

INSERT INTO role_permission (role_permission_id, role_id, permission_id)
SELECT seq_role_permission.NEXTVAL, r.role_id, p.permission_id
FROM role r JOIN permission p ON p.action = 'read'
WHERE r.code IN ('EXECUTIVE','VIEWER');

INSERT INTO role_permission (role_permission_id, role_id, permission_id)
SELECT seq_role_permission.NEXTVAL, r.role_id, p.permission_id
FROM role r
JOIN permission p ON p.code IN (
  'projects:read','project-updates:read','project-updates:create',
  'kanban:read','kanban:create','kanban:update','teams:read',
  'assignments:read','okrs:read','logs:read','logs:create'
)
WHERE r.code = 'TECH_LEAD';

COMMIT;
