-- ============================================================================
-- validate_legacy_migration_integrity.sql
-- Oracle 19c - Data quality, traceability and integrity validation
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

SET SERVEROUTPUT ON;

PROMPT Latest migration batch:

SELECT migration_batch_id, source_file_name, source_version, status,
       total_records, success_records, error_records, started_at, finished_at
FROM migration_batch
WHERE migration_batch_id = (
  SELECT MAX(migration_batch_id) FROM migration_batch
);

PROMPT JSON collection counts versus migrated entity maps:

WITH latest_stg AS (
  SELECT s.migration_batch_id, s.raw_json
  FROM stg_legacy_backup s
  WHERE s.stg_legacy_backup_id = (
    SELECT MAX(stg_legacy_backup_id) FROM stg_legacy_backup
  )
),
json_counts AS (
  SELECT migration_batch_id, 'project' entity_type, COUNT(*) expected_count
  FROM latest_stg s, JSON_TABLE(s.raw_json, '$.projects[*]' COLUMNS (id VARCHAR2(100 CHAR) PATH '$.id')) jt
  GROUP BY migration_batch_id
  UNION ALL
  SELECT migration_batch_id, 'team_member', COUNT(*)
  FROM latest_stg s, JSON_TABLE(s.raw_json, '$.teamMembers[*]' COLUMNS (id VARCHAR2(100 CHAR) PATH '$.id')) jt
  GROUP BY migration_batch_id
  UNION ALL
  SELECT migration_batch_id, 'project_assignment', COUNT(*)
  FROM latest_stg s, JSON_TABLE(s.raw_json, '$.projectAssignments[*]' COLUMNS (id VARCHAR2(100 CHAR) PATH '$.id')) jt
  GROUP BY migration_batch_id
  UNION ALL
  SELECT migration_batch_id, 'project_update', COUNT(*)
  FROM latest_stg s, JSON_TABLE(s.raw_json, '$.projectUpdates[*]' COLUMNS (id VARCHAR2(100 CHAR) PATH '$.id')) jt
  GROUP BY migration_batch_id
  UNION ALL
  SELECT migration_batch_id, 'kanban_card', COUNT(*)
  FROM latest_stg s, JSON_TABLE(s.raw_json, '$.kanban[*]' COLUMNS (id VARCHAR2(100 CHAR) PATH '$.id')) jt
  GROUP BY migration_batch_id
  UNION ALL
  SELECT migration_batch_id, 'activity_log', COUNT(*)
  FROM latest_stg s, JSON_TABLE(s.raw_json, '$.logs[*]' COLUMNS (id VARCHAR2(100 CHAR) PATH '$.id')) jt
  GROUP BY migration_batch_id
  UNION ALL
  SELECT migration_batch_id, 'okr', COUNT(*)
  FROM latest_stg s, JSON_TABLE(s.raw_json, '$.okrs[*]' COLUMNS (id VARCHAR2(100 CHAR) PATH '$.id')) jt
  GROUP BY migration_batch_id
  UNION ALL
  SELECT migration_batch_id, 'okr_activity', COUNT(*)
  FROM latest_stg s,
       JSON_TABLE(s.raw_json, '$.okrs[*]'
         COLUMNS (NESTED PATH '$.activities[*]' COLUMNS (id VARCHAR2(100 CHAR) PATH '$.id'))) jt
  GROUP BY migration_batch_id
  UNION ALL
  SELECT migration_batch_id, 'okr_activity_milestone', COUNT(*)
  FROM latest_stg s,
       JSON_TABLE(s.raw_json, '$.okrs[*]'
         COLUMNS (
           NESTED PATH '$.activities[*]'
           COLUMNS (
             NESTED PATH '$.metas[*]'
             COLUMNS (q VARCHAR2(20 CHAR) PATH '$.q')
           )
         )) jt
  GROUP BY migration_batch_id
),
map_counts AS (
  SELECT migration_batch_id, entity_type, COUNT(*) actual_count
  FROM legacy_id_map
  GROUP BY migration_batch_id, entity_type
),
milestone_counts AS (
  SELECT s.migration_batch_id, COUNT(*) actual_count
  FROM latest_stg s
  JOIN legacy_id_map lim
    ON lim.migration_batch_id = s.migration_batch_id
   AND lim.entity_type = 'okr_activity'
  JOIN okr_activity_milestone m
    ON m.okr_activity_id = lim.new_entity_id
  GROUP BY s.migration_batch_id
)
SELECT jc.entity_type,
       jc.expected_count,
       CASE
         WHEN jc.entity_type = 'okr_activity_milestone' THEN NVL(mc2.actual_count, 0)
         ELSE NVL(mc.actual_count, 0)
       END AS actual_count,
       CASE
         WHEN jc.expected_count =
              CASE
                WHEN jc.entity_type = 'okr_activity_milestone' THEN NVL(mc2.actual_count, 0)
                ELSE NVL(mc.actual_count, 0)
              END
         THEN 'OK'
         ELSE 'MISMATCH'
       END AS validation_status
FROM json_counts jc
LEFT JOIN map_counts mc
  ON mc.migration_batch_id = jc.migration_batch_id
 AND mc.entity_type = jc.entity_type
LEFT JOIN milestone_counts mc2
  ON mc2.migration_batch_id = jc.migration_batch_id
ORDER BY jc.entity_type;

PROMPT Orphan and mapping checks:

SELECT 'legacy_project_references_without_map' check_name, COUNT(*) issue_count
FROM (
  SELECT jt.project_legacy_id
  FROM stg_legacy_backup s,
       JSON_TABLE(s.raw_json, '$.projectUpdates[*]'
         COLUMNS (project_legacy_id VARCHAR2(100 CHAR) PATH '$.projectId')) jt
  WHERE s.stg_legacy_backup_id = (SELECT MAX(stg_legacy_backup_id) FROM stg_legacy_backup)
  UNION ALL
  SELECT jt.project_legacy_id
  FROM stg_legacy_backup s,
       JSON_TABLE(s.raw_json, '$.projectAssignments[*]'
         COLUMNS (project_legacy_id VARCHAR2(100 CHAR) PATH '$.projectId')) jt
  WHERE s.stg_legacy_backup_id = (SELECT MAX(stg_legacy_backup_id) FROM stg_legacy_backup)
) refs
WHERE NOT EXISTS (
  SELECT 1 FROM legacy_id_map lim
  WHERE lim.entity_type = 'project'
    AND lim.legacy_id = refs.project_legacy_id
)
UNION ALL
SELECT 'legacy_team_member_references_without_map', COUNT(*)
FROM stg_legacy_backup s,
     JSON_TABLE(s.raw_json, '$.projectAssignments[*]'
       COLUMNS (member_legacy_id VARCHAR2(100 CHAR) PATH '$.memberId')) jt
WHERE s.stg_legacy_backup_id = (SELECT MAX(stg_legacy_backup_id) FROM stg_legacy_backup)
  AND NOT EXISTS (
    SELECT 1 FROM legacy_id_map lim
    WHERE lim.entity_type = 'team_member'
      AND lim.legacy_id = jt.member_legacy_id
  )
UNION ALL
SELECT 'project_updates_without_project', COUNT(*)
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
SELECT 'okr_activities_without_okr', COUNT(*)
FROM okr_activity oa
WHERE NOT EXISTS (SELECT 1 FROM okr o WHERE o.okr_id = oa.okr_id)
UNION ALL
SELECT 'okr_milestones_without_activity', COUNT(*)
FROM okr_activity_milestone m
WHERE NOT EXISTS (SELECT 1 FROM okr_activity oa WHERE oa.okr_activity_id = m.okr_activity_id);

PROMPT Duplicate legacy identifiers:

SELECT entity_type, legacy_id, COUNT(*) duplicate_count
FROM legacy_id_map
GROUP BY entity_type, legacy_id
HAVING COUNT(*) > 1
ORDER BY entity_type, legacy_id;

PROMPT Migration errors:

SELECT migration_batch_id, entity_type, legacy_id, error_code, error_message, raw_path, created_at
FROM migration_error
ORDER BY migration_error_id;

PROMPT Admin seed validation:

SELECT u.username, u.active, u.is_deleted, r.code AS role_code, COUNT(p.permission_id) permission_count
FROM app_user u
JOIN user_role ur ON ur.user_id = u.user_id AND ur.is_deleted = 'N'
JOIN role r ON r.role_id = ur.role_id AND r.is_deleted = 'N'
JOIN role_permission rp ON rp.role_id = r.role_id AND rp.is_deleted = 'N'
JOIN permission p ON p.permission_id = rp.permission_id AND p.is_deleted = 'N'
WHERE u.username = 'admin'
GROUP BY u.username, u.active, u.is_deleted, r.code;
