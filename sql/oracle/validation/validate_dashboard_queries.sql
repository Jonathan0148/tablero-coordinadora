-- ============================================================================
-- validate_dashboard_queries.sql
-- Oracle 19c - Smoke queries for dashboard, latest update and filters
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

PROMPT Current project status by traffic light:

SELECT
  NVL(traffic_light_name, 'sin update') AS traffic_light,
  COUNT(*) AS project_count
FROM vw_project_current_status
GROUP BY NVL(traffic_light_name, 'sin update')
ORDER BY project_count DESC;

PROMPT Projects requiring coordination:

SELECT project_id, project_name, updated_at_original, traffic_light_name, responsible_area_name
FROM vw_project_current_status
WHERE requires_coordination = 'Y'
ORDER BY updated_at_original DESC;

PROMPT Projects with stoppers:

SELECT project_id, project_name, stopper_owner, stopper_impact_name, updated_at_original
FROM vw_project_current_status
WHERE has_stopper = 'Y'
ORDER BY updated_at_original DESC;

PROMPT Upcoming milestones:

SELECT project_id, project_name, next_milestone, next_milestone_date
FROM vw_project_current_status
WHERE next_milestone_date IS NOT NULL
ORDER BY next_milestone_date ASC;

PROMPT Resource capacity:

SELECT team_member_id, name, default_role_name, assigned_project_count, lead_project_count
FROM vw_team_member_capacity
ORDER BY assigned_project_count DESC, name ASC;

PROMPT Logbook by area:

SELECT wa.name AS area_name, COUNT(*) AS log_count, MAX(al.logged_at_original) AS last_log_at
FROM activity_log al
JOIN work_area wa ON wa.work_area_id = al.work_area_id
WHERE al.is_deleted = 'N'
GROUP BY wa.name
ORDER BY log_count DESC;
