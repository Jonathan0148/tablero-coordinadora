-- ============================================================================
-- validate_legacy_migration_counts.sql
-- Oracle 19c - Validate expected counts for tablero_IT_respaldo_2026-05-19.json
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

PROMPT Expected migrated business counts for the current legacy JSON:
PROMPT project=18, team_member=12, project_assignment=46, project_update=57
PROMPT kanban_card=4, activity_log=16, okr=3, okr_activity=9, okr_activity_milestone=17

SELECT 'project' AS entity_name, 18 AS expected_count, COUNT(*) AS actual_count
FROM project
WHERE is_deleted = 'N'
UNION ALL
SELECT 'team_member', 12, COUNT(*) FROM team_member WHERE is_deleted = 'N'
UNION ALL
SELECT 'project_assignment', 46, COUNT(*) FROM project_assignment WHERE is_deleted = 'N'
UNION ALL
SELECT 'project_update', 57, COUNT(*) FROM project_update WHERE is_deleted = 'N'
UNION ALL
SELECT 'kanban_card', 4, COUNT(*) FROM kanban_card WHERE is_deleted = 'N'
UNION ALL
SELECT 'activity_log', 16, COUNT(*) FROM activity_log WHERE is_deleted = 'N'
UNION ALL
SELECT 'okr', 3, COUNT(*) FROM okr WHERE is_deleted = 'N'
UNION ALL
SELECT 'okr_activity', 9, COUNT(*) FROM okr_activity WHERE is_deleted = 'N'
UNION ALL
SELECT 'okr_activity_milestone', 17, COUNT(*) FROM okr_activity_milestone WHERE is_deleted = 'N';

PROMPT Referential integrity smoke checks:

SELECT 'project_updates_without_project' AS check_name, COUNT(*) AS issue_count
FROM project_update pu
WHERE NOT EXISTS (SELECT 1 FROM project p WHERE p.project_id = pu.project_id)
UNION ALL
SELECT 'assignments_without_project', COUNT(*)
FROM project_assignment pa
WHERE NOT EXISTS (SELECT 1 FROM project p WHERE p.project_id = pa.project_id)
UNION ALL
SELECT 'assignments_without_member', COUNT(*)
FROM project_assignment pa
WHERE NOT EXISTS (SELECT 1 FROM team_member tm WHERE tm.team_member_id = pa.team_member_id)
UNION ALL
SELECT 'kanban_without_required_catalogs', COUNT(*)
FROM kanban_card kc
WHERE NOT EXISTS (SELECT 1 FROM work_area wa WHERE wa.work_area_id = kc.work_area_id)
   OR NOT EXISTS (SELECT 1 FROM priority_level pl WHERE pl.priority_level_id = kc.priority_level_id)
   OR NOT EXISTS (SELECT 1 FROM kanban_status ks WHERE ks.kanban_status_id = kc.kanban_status_id);

PROMPT Migration errors:

SELECT migration_batch_id, entity_type, legacy_id, error_code, error_message, raw_path, created_at
FROM migration_error
ORDER BY migration_error_id;
