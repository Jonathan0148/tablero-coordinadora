-- ============================================================================
-- V007__foreign_keys.sql
-- Oracle 19c - Referential integrity constraints
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

ALTER TABLE user_role ADD CONSTRAINT fk_user_role__app_user
  FOREIGN KEY (user_id) REFERENCES app_user (user_id);
ALTER TABLE user_role ADD CONSTRAINT fk_user_role__role
  FOREIGN KEY (role_id) REFERENCES role (role_id);

ALTER TABLE role_permission ADD CONSTRAINT fk_role_permission__role
  FOREIGN KEY (role_id) REFERENCES role (role_id);
ALTER TABLE role_permission ADD CONSTRAINT fk_role_permission__permission
  FOREIGN KEY (permission_id) REFERENCES permission (permission_id);

ALTER TABLE auth_refresh_token ADD CONSTRAINT fk_auth_refresh_token__app_user
  FOREIGN KEY (user_id) REFERENCES app_user (user_id);

ALTER TABLE project ADD CONSTRAINT fk_project__pipeline_status
  FOREIGN KEY (pipeline_status_id) REFERENCES pipeline_status (pipeline_status_id);

ALTER TABLE team_member ADD CONSTRAINT fk_team_member__tech_role
  FOREIGN KEY (default_role_id) REFERENCES tech_role (tech_role_id);

ALTER TABLE project_assignment ADD CONSTRAINT fk_project_assignment__project
  FOREIGN KEY (project_id) REFERENCES project (project_id);
ALTER TABLE project_assignment ADD CONSTRAINT fk_project_assignment__team_member
  FOREIGN KEY (team_member_id) REFERENCES team_member (team_member_id);
ALTER TABLE project_assignment ADD CONSTRAINT fk_project_assignment__tech_role
  FOREIGN KEY (role_id) REFERENCES tech_role (tech_role_id);

ALTER TABLE project_update ADD CONSTRAINT fk_project_update__project
  FOREIGN KEY (project_id) REFERENCES project (project_id);
ALTER TABLE project_update ADD CONSTRAINT fk_project_update__executive_status
  FOREIGN KEY (executive_status_id) REFERENCES executive_status (executive_status_id);
ALTER TABLE project_update ADD CONSTRAINT fk_project_update__traffic_light
  FOREIGN KEY (traffic_light_id) REFERENCES traffic_light (traffic_light_id);
ALTER TABLE project_update ADD CONSTRAINT fk_project_update__stopper_impact
  FOREIGN KEY (stopper_impact_id) REFERENCES stopper_impact (stopper_impact_id);
ALTER TABLE project_update ADD CONSTRAINT fk_project_update__responsible_area
  FOREIGN KEY (responsible_area_id) REFERENCES responsible_area (responsible_area_id);

ALTER TABLE kanban_card ADD CONSTRAINT fk_kanban_card__work_area
  FOREIGN KEY (work_area_id) REFERENCES work_area (work_area_id);
ALTER TABLE kanban_card ADD CONSTRAINT fk_kanban_card__priority_level
  FOREIGN KEY (priority_level_id) REFERENCES priority_level (priority_level_id);
ALTER TABLE kanban_card ADD CONSTRAINT fk_kanban_card__kanban_status
  FOREIGN KEY (kanban_status_id) REFERENCES kanban_status (kanban_status_id);
ALTER TABLE kanban_card ADD CONSTRAINT fk_kanban_card__project
  FOREIGN KEY (project_id) REFERENCES project (project_id);

ALTER TABLE notification_reminder ADD CONSTRAINT fk_notification_reminder__kanban
  FOREIGN KEY (kanban_card_id) REFERENCES kanban_card (kanban_card_id);
ALTER TABLE notification_reminder ADD CONSTRAINT fk_notification_reminder__project_update
  FOREIGN KEY (project_update_id) REFERENCES project_update (project_update_id);

ALTER TABLE activity_log ADD CONSTRAINT fk_activity_log__work_area
  FOREIGN KEY (work_area_id) REFERENCES work_area (work_area_id);

ALTER TABLE okr_activity ADD CONSTRAINT fk_okr_activity__okr
  FOREIGN KEY (okr_id) REFERENCES okr (okr_id);
ALTER TABLE okr_activity ADD CONSTRAINT fk_okr_activity__status
  FOREIGN KEY (status_id) REFERENCES okr_activity_status (okr_activity_status_id);
ALTER TABLE okr_activity_milestone ADD CONSTRAINT fk_okr_activity_milestone__activity
  FOREIGN KEY (okr_activity_id) REFERENCES okr_activity (okr_activity_id);

ALTER TABLE legacy_id_map ADD CONSTRAINT fk_legacy_id_map__migration_batch
  FOREIGN KEY (migration_batch_id) REFERENCES migration_batch (migration_batch_id);
ALTER TABLE migration_error ADD CONSTRAINT fk_migration_error__migration_batch
  FOREIGN KEY (migration_batch_id) REFERENCES migration_batch (migration_batch_id);
ALTER TABLE stg_legacy_backup ADD CONSTRAINT fk_stg_legacy_backup__migration_batch
  FOREIGN KEY (migration_batch_id) REFERENCES migration_batch (migration_batch_id);

ALTER TABLE audit_event ADD CONSTRAINT fk_audit_event__performed_by
  FOREIGN KEY (performed_by) REFERENCES app_user (user_id);

-- Optional audit FKs. They are nullable to support technical loads/migration.
ALTER TABLE project ADD CONSTRAINT fk_project__created_by FOREIGN KEY (created_by) REFERENCES app_user (user_id);
ALTER TABLE project ADD CONSTRAINT fk_project__updated_by FOREIGN KEY (updated_by) REFERENCES app_user (user_id);
ALTER TABLE project ADD CONSTRAINT fk_project__deleted_by FOREIGN KEY (deleted_by) REFERENCES app_user (user_id);

ALTER TABLE project_update ADD CONSTRAINT fk_project_update__created_by FOREIGN KEY (created_by) REFERENCES app_user (user_id);
ALTER TABLE project_update ADD CONSTRAINT fk_project_update__updated_by FOREIGN KEY (updated_by) REFERENCES app_user (user_id);
ALTER TABLE project_update ADD CONSTRAINT fk_project_update__deleted_by FOREIGN KEY (deleted_by) REFERENCES app_user (user_id);

COMMIT;
