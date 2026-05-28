-- ============================================================================
-- R001__drop_all_objects.sql
-- Oracle 19c - Basic rollback for local/dev environments
--
-- WARNING:
-- This script drops all objects created by the FASE 4 migration scripts.
-- Use only in local/dev schemas. Do not run in production without approval.
-- ============================================================================

WHENEVER SQLERROR CONTINUE;

DROP TRIGGER trg_project_update_no_delete;
DROP TRIGGER trg_project_update_append_only;

DROP TRIGGER trg_legacy_id_map_audit_biu;
DROP TRIGGER trg_migration_batch_audit_biu;
DROP TRIGGER trg_okr_activity_milestone_audit_biu;
DROP TRIGGER trg_okr_activity_audit_biu;
DROP TRIGGER trg_okr_audit_biu;
DROP TRIGGER trg_activity_log_audit_biu;
DROP TRIGGER trg_notification_reminder_audit_biu;
DROP TRIGGER trg_kanban_card_audit_biu;
DROP TRIGGER trg_project_update_audit_biu;
DROP TRIGGER trg_project_assignment_audit_biu;
DROP TRIGGER trg_team_member_audit_biu;
DROP TRIGGER trg_project_audit_biu;
DROP TRIGGER trg_okr_activity_status_audit_biu;
DROP TRIGGER trg_tech_role_audit_biu;
DROP TRIGGER trg_responsible_area_audit_biu;
DROP TRIGGER trg_stopper_impact_audit_biu;
DROP TRIGGER trg_priority_level_audit_biu;
DROP TRIGGER trg_kanban_status_audit_biu;
DROP TRIGGER trg_work_area_audit_biu;
DROP TRIGGER trg_traffic_light_audit_biu;
DROP TRIGGER trg_executive_status_audit_biu;
DROP TRIGGER trg_pipeline_status_audit_biu;
DROP TRIGGER trg_auth_refresh_token_audit_biu;
DROP TRIGGER trg_role_permission_audit_biu;
DROP TRIGGER trg_user_role_audit_biu;
DROP TRIGGER trg_permission_audit_biu;
DROP TRIGGER trg_role_audit_biu;
DROP TRIGGER trg_app_user_audit_biu;

DROP VIEW vw_team_member_capacity;
DROP VIEW vw_project_current_status;

DROP PACKAGE pkg_legacy_json_migration;
DROP PACKAGE pkg_oracle_audit;

DROP TABLE stg_legacy_backup CASCADE CONSTRAINTS PURGE;
DROP TABLE audit_event CASCADE CONSTRAINTS PURGE;
DROP TABLE migration_error CASCADE CONSTRAINTS PURGE;
DROP TABLE legacy_id_map CASCADE CONSTRAINTS PURGE;
DROP TABLE migration_batch CASCADE CONSTRAINTS PURGE;

DROP TABLE okr_activity_milestone CASCADE CONSTRAINTS PURGE;
DROP TABLE okr_activity CASCADE CONSTRAINTS PURGE;
DROP TABLE okr CASCADE CONSTRAINTS PURGE;
DROP TABLE activity_log CASCADE CONSTRAINTS PURGE;
DROP TABLE notification_reminder CASCADE CONSTRAINTS PURGE;
DROP TABLE kanban_card CASCADE CONSTRAINTS PURGE;
DROP TABLE project_update CASCADE CONSTRAINTS PURGE;
DROP TABLE project_assignment CASCADE CONSTRAINTS PURGE;
DROP TABLE team_member CASCADE CONSTRAINTS PURGE;
DROP TABLE project CASCADE CONSTRAINTS PURGE;

DROP TABLE auth_refresh_token CASCADE CONSTRAINTS PURGE;
DROP TABLE role_permission CASCADE CONSTRAINTS PURGE;
DROP TABLE user_role CASCADE CONSTRAINTS PURGE;
DROP TABLE permission CASCADE CONSTRAINTS PURGE;
DROP TABLE role CASCADE CONSTRAINTS PURGE;
DROP TABLE oracle_audit_principal CASCADE CONSTRAINTS PURGE;
DROP TABLE app_user CASCADE CONSTRAINTS PURGE;

DROP TABLE okr_activity_status CASCADE CONSTRAINTS PURGE;
DROP TABLE tech_role CASCADE CONSTRAINTS PURGE;
DROP TABLE responsible_area CASCADE CONSTRAINTS PURGE;
DROP TABLE stopper_impact CASCADE CONSTRAINTS PURGE;
DROP TABLE priority_level CASCADE CONSTRAINTS PURGE;
DROP TABLE kanban_status CASCADE CONSTRAINTS PURGE;
DROP TABLE work_area CASCADE CONSTRAINTS PURGE;
DROP TABLE traffic_light CASCADE CONSTRAINTS PURGE;
DROP TABLE executive_status CASCADE CONSTRAINTS PURGE;
DROP TABLE pipeline_status CASCADE CONSTRAINTS PURGE;

DROP SEQUENCE seq_stg_legacy_backup;
DROP SEQUENCE seq_audit_event;
DROP SEQUENCE seq_migration_error;
DROP SEQUENCE seq_legacy_id_map;
DROP SEQUENCE seq_migration_batch;
DROP SEQUENCE seq_okr_activity_milestone;
DROP SEQUENCE seq_okr_activity;
DROP SEQUENCE seq_okr;
DROP SEQUENCE seq_activity_log;
DROP SEQUENCE seq_notification_reminder;
DROP SEQUENCE seq_kanban_card;
DROP SEQUENCE seq_project_update;
DROP SEQUENCE seq_project_assignment;
DROP SEQUENCE seq_team_member;
DROP SEQUENCE seq_project;
DROP SEQUENCE seq_okr_activity_status;
DROP SEQUENCE seq_tech_role;
DROP SEQUENCE seq_responsible_area;
DROP SEQUENCE seq_stopper_impact;
DROP SEQUENCE seq_priority_level;
DROP SEQUENCE seq_kanban_status;
DROP SEQUENCE seq_work_area;
DROP SEQUENCE seq_traffic_light;
DROP SEQUENCE seq_executive_status;
DROP SEQUENCE seq_pipeline_status;
DROP SEQUENCE seq_auth_refresh_token;
DROP SEQUENCE seq_role_permission;
DROP SEQUENCE seq_user_role;
DROP SEQUENCE seq_permission;
DROP SEQUENCE seq_role;
DROP SEQUENCE seq_app_user;

COMMIT;
