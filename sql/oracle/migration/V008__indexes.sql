-- ============================================================================
-- V008__indexes.sql
-- Oracle 19c - Performance indexes for dashboard, filters, RBAC and migration
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

-- Security / RBAC
CREATE INDEX ix_app_user__active ON app_user (active, is_deleted);
CREATE INDEX ix_user_role__user ON user_role (user_id, is_deleted);
CREATE INDEX ix_user_role__role ON user_role (role_id, is_deleted);
CREATE INDEX ix_role_permission__role ON role_permission (role_id, is_deleted);
CREATE INDEX ix_auth_refresh_token__user ON auth_refresh_token (user_id, revoked_at);
CREATE INDEX ix_auth_refresh_token__expires ON auth_refresh_token (expires_at);

-- Catalogs
CREATE INDEX ix_pipeline_status__active ON pipeline_status (active, sort_order);
CREATE INDEX ix_executive_status__active ON executive_status (active, sort_order);
CREATE INDEX ix_traffic_light__active ON traffic_light (active, sort_order);
CREATE INDEX ix_work_area__active ON work_area (active, sort_order);
CREATE INDEX ix_tech_role__active ON tech_role (active, sort_order);

-- Portfolio and teams
CREATE INDEX ix_project__pipeline_status ON project (pipeline_status_id, is_deleted);
CREATE INDEX ix_project__legacy_updated_at ON project (legacy_updated_at);
CREATE INDEX ix_project__name ON project (name);
CREATE INDEX ix_project__deleted ON project (is_deleted);

CREATE INDEX ix_team_member__default_role ON team_member (default_role_id);
CREATE INDEX ix_team_member__active ON team_member (active, is_deleted);
CREATE INDEX ix_team_member__name ON team_member (name);

CREATE INDEX ix_project_assignment__project ON project_assignment (project_id, is_deleted);
CREATE INDEX ix_project_assignment__member ON project_assignment (team_member_id, is_deleted);
CREATE INDEX ix_project_assignment__role ON project_assignment (role_id);
CREATE INDEX ix_project_assignment__lead ON project_assignment (project_id, is_lead, is_deleted);

-- Enforces one active lead per project in Oracle using a function-based unique index.
CREATE UNIQUE INDEX uk_project_assignment__active_lead
ON project_assignment (
  CASE WHEN is_lead = 'Y' AND is_deleted = 'N' AND valid_to IS NULL THEN project_id END
);

-- Executive dashboard / latest project update
CREATE INDEX ix_project_update__project_date ON project_update (project_id, updated_at_original DESC);
CREATE INDEX ix_project_update__traffic_light ON project_update (traffic_light_id, is_deleted);
CREATE INDEX ix_project_update__executive_status ON project_update (executive_status_id, is_deleted);
CREATE INDEX ix_project_update__coordination ON project_update (requires_coordination, is_deleted);
CREATE INDEX ix_project_update__stopper ON project_update (has_stopper, stopper_impact_id, is_deleted);
CREATE INDEX ix_project_update__milestone_date ON project_update (next_milestone_date);
-- CREATE INDEX ix_project_update__legacy_id ON project_update (legacy_id);

-- Kanban / reminders
CREATE INDEX ix_kanban_card__status ON kanban_card (kanban_status_id, is_deleted);
CREATE INDEX ix_kanban_card__priority ON kanban_card (priority_level_id, is_deleted);
CREATE INDEX ix_kanban_card__area ON kanban_card (work_area_id, is_deleted);
CREATE INDEX ix_kanban_card__due_date ON kanban_card (due_date);
CREATE INDEX ix_kanban_card__reminder ON kanban_card (reminder_at);
CREATE INDEX ix_kanban_card__project ON kanban_card (project_id);

CREATE INDEX ix_notification_reminder__status_time ON notification_reminder (status, reminder_at, is_deleted);
CREATE INDEX ix_notification_reminder__kanban ON notification_reminder (kanban_card_id);
CREATE INDEX ix_notification_reminder__project_update ON notification_reminder (project_update_id);

-- Logbook
CREATE INDEX ix_activity_log__logged_at ON activity_log (logged_at_original DESC);
CREATE INDEX ix_activity_log__area ON activity_log (work_area_id, logged_at_original DESC);
-- CREATE INDEX ix_activity_log__legacy_id ON activity_log (legacy_id);

-- OKRs
CREATE INDEX ix_okr__sort_order ON okr (sort_order, is_deleted);
CREATE INDEX ix_okr_activity__okr ON okr_activity (okr_id, sort_order, is_deleted);
CREATE INDEX ix_okr_activity__status ON okr_activity (status_id, is_deleted);
CREATE INDEX ix_okr_activity_milestone__activity ON okr_activity_milestone (okr_activity_id, sort_order);
CREATE INDEX ix_okr_activity_milestone__quarter ON okr_activity_milestone (quarter_code, quarter_label);

-- Migration and audit
CREATE INDEX ix_migration_batch__status ON migration_batch (status, started_at DESC);
CREATE INDEX ix_legacy_id_map__entity_legacy ON legacy_id_map (entity_type, legacy_id);
CREATE INDEX ix_legacy_id_map__new_entity ON legacy_id_map (new_entity_table, new_entity_id);
CREATE INDEX ix_migration_error__batch ON migration_error (migration_batch_id);
CREATE INDEX ix_migration_error__entity ON migration_error (entity_type, legacy_id);
CREATE INDEX ix_stg_legacy_backup__batch ON stg_legacy_backup (migration_batch_id);

CREATE INDEX ix_audit_event__performed_at ON audit_event (performed_at DESC);
CREATE INDEX ix_audit_event__entity ON audit_event (entity_name, entity_id);
CREATE INDEX ix_audit_event__performed_by ON audit_event (performed_by, performed_at DESC);
CREATE INDEX ix_audit_event__event_type ON audit_event (event_type, performed_at DESC);

COMMIT;
