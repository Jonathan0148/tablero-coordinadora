-- ============================================================================
-- V009__views_and_append_only_triggers.sql
-- Oracle 19c - Current status views and append-only protection
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

CREATE OR REPLACE VIEW vw_project_current_status AS
SELECT
  p.project_id,
  p.legacy_id AS project_legacy_id,
  p.name AS project_name,
  ps.code AS pipeline_status_code,
  ps.name AS pipeline_status_name,
  pu.project_update_id,
  pu.legacy_id AS project_update_legacy_id,
  pu.updated_at_original,
  es.code AS executive_status_code,
  es.name AS executive_status_name,
  tl.code AS traffic_light_code,
  tl.name AS traffic_light_name,
  pu.summary,
  pu.has_stopper,
  pu.stopper_owner,
  si.code AS stopper_impact_code,
  si.name AS stopper_impact_name,
  pu.requires_coordination,
  pu.coordination_desc,
  ra.code AS responsible_area_code,
  ra.name AS responsible_area_name,
  pu.next_milestone,
  pu.next_milestone_date
FROM project p
JOIN pipeline_status ps ON ps.pipeline_status_id = p.pipeline_status_id
LEFT JOIN (
  SELECT x.*
  FROM (
    SELECT
      pu.*,
      ROW_NUMBER() OVER (
        PARTITION BY pu.project_id
        ORDER BY pu.updated_at_original DESC, pu.project_update_id DESC
      ) AS rn
    FROM project_update pu
    WHERE pu.is_deleted = 'N'
  ) x
  WHERE x.rn = 1
) pu ON pu.project_id = p.project_id
LEFT JOIN executive_status es ON es.executive_status_id = pu.executive_status_id
LEFT JOIN traffic_light tl ON tl.traffic_light_id = pu.traffic_light_id
LEFT JOIN stopper_impact si ON si.stopper_impact_id = pu.stopper_impact_id
LEFT JOIN responsible_area ra ON ra.responsible_area_id = pu.responsible_area_id
WHERE p.is_deleted = 'N';

CREATE OR REPLACE VIEW vw_team_member_capacity AS
SELECT
  tm.team_member_id,
  tm.legacy_id AS team_member_legacy_id,
  tm.name,
  tr.name AS default_role_name,
  tm.active,
  COUNT(pa.project_assignment_id) AS assigned_project_count,
  SUM(CASE WHEN pa.is_lead = 'Y' THEN 1 ELSE 0 END) AS lead_project_count
FROM team_member tm
LEFT JOIN tech_role tr ON tr.tech_role_id = tm.default_role_id
LEFT JOIN project_assignment pa
  ON pa.team_member_id = tm.team_member_id
 AND pa.is_deleted = 'N'
 AND pa.valid_to IS NULL
WHERE tm.is_deleted = 'N'
GROUP BY tm.team_member_id, tm.legacy_id, tm.name, tr.name, tm.active;

CREATE OR REPLACE TRIGGER trg_project_update_append_only
BEFORE UPDATE ON project_update
FOR EACH ROW
BEGIN
  IF UPDATING('PROJECT_ID')
     OR UPDATING('LEGACY_ID')
     OR UPDATING('UPDATED_AT_ORIGINAL')
     OR UPDATING('EXECUTIVE_STATUS_ID')
     OR UPDATING('TRAFFIC_LIGHT_ID')
     OR UPDATING('SUMMARY')
     OR UPDATING('PENDING_ITEMS')
     OR UPDATING('HAS_STOPPER')
     OR UPDATING('STOPPER_DESC')
     OR UPDATING('STOPPER_OWNER')
     OR UPDATING('STOPPER_IMPACT_ID')
     OR UPDATING('RELEVANT_RISKS')
     OR UPDATING('NEXT_MILESTONE')
     OR UPDATING('NEXT_MILESTONE_DATE')
     OR UPDATING('PENDING_DECISIONS')
     OR UPDATING('REQUIRES_COORDINATION')
     OR UPDATING('COORDINATION_DESC')
     OR UPDATING('RESPONSIBLE_AREA_ID')
     OR UPDATING('RESPONSIBLE_ACTION')
     OR UPDATING('ADDITIONAL_NOTES')
  THEN
    RAISE_APPLICATION_ERROR(-20001, 'project_update is append-only. Create a new update instead of modifying history.');
  END IF;

  IF :OLD.is_deleted = 'Y' AND :NEW.is_deleted = 'N' THEN
    RAISE_APPLICATION_ERROR(-20002, 'project_update soft-delete cannot be reverted without DBA-approved procedure.');
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_project_update_no_delete
BEFORE DELETE ON project_update
FOR EACH ROW
BEGIN
  RAISE_APPLICATION_ERROR(-20003, 'Physical delete is forbidden for project_update. Use administrative soft delete.');
END;
/

COMMIT;
