-- ============================================================================
-- V010__legacy_json_migration_package.sql
-- Oracle 19c - JSON backup to normalized Oracle tables
--
-- Usage outline:
-- 1) INSERT migration_batch with status PENDING.
-- 2) INSERT stg_legacy_backup(raw_json) with the exported JSON CLOB.
-- 3) EXEC pkg_legacy_json_migration.import_backup(<stg_legacy_backup_id>);
-- 4) Run validation scripts from sql/oracle/validation.
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

CREATE OR REPLACE PACKAGE pkg_legacy_json_migration AS
  PROCEDURE import_backup(p_stg_legacy_backup_id IN NUMBER);
  PROCEDURE rollback_batch(p_migration_batch_id IN NUMBER);
END pkg_legacy_json_migration;
/

CREATE OR REPLACE PACKAGE BODY pkg_legacy_json_migration AS

  PROCEDURE log_error(
    p_batch_id IN NUMBER,
    p_entity_type IN VARCHAR2,
    p_legacy_id IN VARCHAR2,
    p_error_code IN VARCHAR2,
    p_error_message IN VARCHAR2,
    p_raw_path IN VARCHAR2
  ) IS
  BEGIN
    INSERT INTO migration_error (
      migration_error_id, migration_batch_id, entity_type, legacy_id,
      error_code, error_message, raw_path, created_at
    ) VALUES (
      seq_migration_error.NEXTVAL, p_batch_id, p_entity_type, p_legacy_id,
      p_error_code, SUBSTR(p_error_message, 1, 1000), p_raw_path, SYSTIMESTAMP
    );
  END log_error;

  PROCEDURE map_entity(
    p_batch_id IN NUMBER,
    p_entity_type IN VARCHAR2,
    p_legacy_id IN VARCHAR2,
    p_table IN VARCHAR2,
    p_new_id IN NUMBER
  ) IS
  BEGIN
    IF p_legacy_id IS NOT NULL THEN
      INSERT INTO legacy_id_map (
        legacy_id_map_id, migration_batch_id, entity_type, legacy_id,
        new_entity_table, new_entity_id
      ) VALUES (
        seq_legacy_id_map.NEXTVAL, p_batch_id, p_entity_type, p_legacy_id,
        p_table, p_new_id
      );
    END IF;
  EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
      NULL;
  END map_entity;

  PROCEDURE import_backup(p_stg_legacy_backup_id IN NUMBER) IS
    v_batch_id NUMBER(19, 0);
    v_json CLOB;
    v_total NUMBER := 0;
    v_success NUMBER := 0;
    v_error_count NUMBER := 0;
  BEGIN
    SELECT migration_batch_id, raw_json
    INTO v_batch_id, v_json
    FROM stg_legacy_backup
    WHERE stg_legacy_backup_id = p_stg_legacy_backup_id;

    UPDATE migration_batch
    SET status = 'RUNNING',
        started_at = SYSTIMESTAMP,
        updated_at = SYSTIMESTAMP
    WHERE migration_batch_id = v_batch_id;

    -- Projects
    FOR r IN (
      SELECT jt.*
      FROM JSON_TABLE(v_json, '$.projects[*]'
        COLUMNS (
          legacy_id VARCHAR2(100 CHAR) PATH '$.id',
          name VARCHAR2(250 CHAR) PATH '$.name',
          pipeline_status_name VARCHAR2(150 CHAR) PATH '$.pipelineStatus',
          start_value VARCHAR2(30 CHAR) PATH '$.start',
          updated_at_value VARCHAR2(80 CHAR) PATH '$.updatedAt'
        )
      ) jt
    ) LOOP
      DECLARE
        v_id NUMBER(19,0);
        v_status_id NUMBER(19,0);
        v_start_date DATE;
        v_legacy_updated_at TIMESTAMP WITH TIME ZONE;
      BEGIN
        SELECT seq_project.NEXTVAL INTO v_id FROM dual;

        SELECT pipeline_status_id INTO v_status_id
        FROM pipeline_status
        WHERE name = r.pipeline_status_name;

        IF NULLIF(TRIM(r.start_value), '') IS NOT NULL THEN
          v_start_date := TO_DATE(r.start_value, 'YYYY-MM-DD');
        END IF;

        IF NULLIF(TRIM(r.updated_at_value), '') IS NOT NULL THEN
          v_legacy_updated_at := TO_TIMESTAMP_TZ(
            REPLACE(r.updated_at_value, 'Z', '+00:00'),
            'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM'
          );
        END IF;

        INSERT INTO project (
          project_id, legacy_id, name, pipeline_status_id, start_date,
          legacy_updated_at, is_ghost
        ) VALUES (
          v_id, r.legacy_id, r.name, v_status_id, v_start_date,
          v_legacy_updated_at,
          CASE WHEN r.legacy_id IN ('9000001','9000002') THEN 'Y' ELSE 'N' END
        );

        map_entity(v_batch_id, 'project', r.legacy_id, 'project', v_id);
        v_success := v_success + 1;
      EXCEPTION
        WHEN OTHERS THEN
          log_error(v_batch_id, 'project', r.legacy_id, TO_CHAR(SQLCODE), SQLERRM, '$.projects');
      END;
      v_total := v_total + 1;
    END LOOP;

    -- Team members
    FOR r IN (
      SELECT jt.*
      FROM JSON_TABLE(v_json, '$.teamMembers[*]'
        COLUMNS (
          legacy_id VARCHAR2(100 CHAR) PATH '$.id',
          name VARCHAR2(200 CHAR) PATH '$.name',
          role_name VARCHAR2(150 CHAR) PATH '$.roleLabel',
          email VARCHAR2(150 CHAR) PATH '$.email',
          active_value VARCHAR2(10 CHAR) PATH '$.active',
          notes CLOB PATH '$.notes'
        )
      ) jt
    ) LOOP
      DECLARE
        v_id NUMBER(19,0);
        v_role_id NUMBER(19,0);
      BEGIN
        SELECT seq_team_member.NEXTVAL INTO v_id FROM dual;
        SELECT tech_role_id INTO v_role_id FROM tech_role WHERE name = r.role_name;

        INSERT INTO team_member (
          team_member_id, legacy_id, name, default_role_id, email, active, notes
        ) VALUES (
          v_id,
          r.legacy_id,
          r.name,
          v_role_id,
          NULLIF(r.email, ''),
          CASE WHEN LOWER(TRIM(r.active_value)) = 'true' THEN 'Y' ELSE 'N' END,
          r.notes
        );

        map_entity(v_batch_id, 'team_member', r.legacy_id, 'team_member', v_id);
        v_success := v_success + 1;
      EXCEPTION
        WHEN OTHERS THEN
          log_error(v_batch_id, 'team_member', r.legacy_id, TO_CHAR(SQLCODE), SQLERRM, '$.teamMembers');
      END;
      v_total := v_total + 1;
    END LOOP;

    -- Project assignments
    FOR r IN (
      SELECT jt.*
      FROM JSON_TABLE(v_json, '$.projectAssignments[*]'
        COLUMNS (
          legacy_id VARCHAR2(100 CHAR) PATH '$.id',
          project_legacy_id VARCHAR2(100 CHAR) PATH '$.projectId',
          member_legacy_id VARCHAR2(100 CHAR) PATH '$.memberId',
          role_name VARCHAR2(150 CHAR) PATH '$.roleLabel',
          is_lead_value VARCHAR2(10 CHAR) PATH '$.isLead'
        )
      ) jt
    ) LOOP
      DECLARE
        v_id NUMBER(19,0);
        v_project_id NUMBER(19,0);
        v_member_id NUMBER(19,0);
        v_role_id NUMBER(19,0);
      BEGIN
        SELECT seq_project_assignment.NEXTVAL INTO v_id FROM dual;

        SELECT new_entity_id INTO v_project_id
        FROM legacy_id_map
        WHERE migration_batch_id = v_batch_id
          AND entity_type = 'project'
          AND legacy_id = r.project_legacy_id;

        SELECT new_entity_id INTO v_member_id
        FROM legacy_id_map
        WHERE migration_batch_id = v_batch_id
          AND entity_type = 'team_member'
          AND legacy_id = r.member_legacy_id;

        SELECT tech_role_id INTO v_role_id
        FROM tech_role
        WHERE name = r.role_name;

        INSERT INTO project_assignment (
          project_assignment_id, legacy_id, project_id, team_member_id, role_id, is_lead
        ) VALUES (
          v_id,
          r.legacy_id,
          v_project_id,
          v_member_id,
          v_role_id,
          CASE WHEN LOWER(TRIM(r.is_lead_value)) = 'true' THEN 'Y' ELSE 'N' END
        );

        map_entity(v_batch_id, 'project_assignment', r.legacy_id, 'project_assignment', v_id);
        v_success := v_success + 1;
      EXCEPTION
        WHEN OTHERS THEN
          log_error(v_batch_id, 'project_assignment', r.legacy_id, TO_CHAR(SQLCODE), SQLERRM, '$.projectAssignments');
      END;
      v_total := v_total + 1;
    END LOOP;

    -- Project updates
    FOR r IN (
      SELECT jt.*
      FROM JSON_TABLE(v_json, '$.projectUpdates[*]'
        COLUMNS (
          legacy_id VARCHAR2(100 CHAR) PATH '$.id',
          project_legacy_id VARCHAR2(100 CHAR) PATH '$.projectId',
          updated_at_value VARCHAR2(80 CHAR) PATH '$.updatedAt',
          general_status_name VARCHAR2(150 CHAR) PATH '$.generalStatus',
          traffic_light_name VARCHAR2(150 CHAR) PATH '$.trafficLight',
          summary CLOB PATH '$.summary',
          pending_items CLOB PATH '$.pendingItems',
          has_stopper_value VARCHAR2(10 CHAR) PATH '$.hasStopper',
          stopper_desc CLOB PATH '$.stopperDesc',
          stopper_owner VARCHAR2(250 CHAR) PATH '$.stopperOwner',
          stopper_impact_name VARCHAR2(150 CHAR) PATH '$.stopperImpact',
          relevant_risks CLOB PATH '$.relevantRisks',
          next_milestone VARCHAR2(500 CHAR) PATH '$.nextMilestone',
          next_milestone_date_value VARCHAR2(30 CHAR) PATH '$.nextMilestoneDate',
          pending_decisions CLOB PATH '$.pendingDecisions',
          requires_coord_value VARCHAR2(10 CHAR) PATH '$.requiresCoordination',
          coordination_desc CLOB PATH '$.coordinationDesc',
          responsible_area_name VARCHAR2(150 CHAR) PATH '$.responsibleArea',
          responsible_action CLOB PATH '$.responsibleAction',
          additional_notes CLOB PATH '$.additionalNotes'
        )
      ) jt
    ) LOOP
      DECLARE
        v_id NUMBER(19,0);
        v_project_id NUMBER(19,0);
        v_exec_status_id NUMBER(19,0);
        v_tl_id NUMBER(19,0);
        v_impact_id NUMBER(19,0);
        v_resp_area_id NUMBER(19,0);
        v_updated_at TIMESTAMP WITH TIME ZONE;
        v_next_milestone_date DATE;
      BEGIN
        SELECT seq_project_update.NEXTVAL INTO v_id FROM dual;

        SELECT new_entity_id INTO v_project_id
        FROM legacy_id_map
        WHERE migration_batch_id = v_batch_id
          AND entity_type = 'project'
          AND legacy_id = r.project_legacy_id;

        SELECT executive_status_id INTO v_exec_status_id
        FROM executive_status
        WHERE name = r.general_status_name;

        SELECT traffic_light_id INTO v_tl_id
        FROM traffic_light
        WHERE name = r.traffic_light_name;

        IF NULLIF(TRIM(r.stopper_impact_name), '') IS NOT NULL THEN
          SELECT stopper_impact_id INTO v_impact_id
          FROM stopper_impact
          WHERE name = r.stopper_impact_name;
        END IF;

        IF NULLIF(TRIM(r.responsible_area_name), '') IS NOT NULL THEN
          SELECT responsible_area_id INTO v_resp_area_id
          FROM responsible_area
          WHERE name = r.responsible_area_name;
        END IF;

        v_updated_at := TO_TIMESTAMP_TZ(
          REPLACE(r.updated_at_value, 'Z', '+00:00'),
          'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM'
        );

        IF NULLIF(TRIM(r.next_milestone_date_value), '') IS NOT NULL THEN
          v_next_milestone_date := TO_DATE(r.next_milestone_date_value, 'YYYY-MM-DD');
        END IF;

        INSERT INTO project_update (
          project_update_id, legacy_id, project_id, updated_at_original,
          executive_status_id, traffic_light_id, summary, pending_items,
          has_stopper, stopper_desc, stopper_owner, stopper_impact_id,
          relevant_risks, next_milestone, next_milestone_date, pending_decisions,
          requires_coordination, coordination_desc, responsible_area_id,
          responsible_action, additional_notes
        ) VALUES (
          v_id,
          r.legacy_id,
          v_project_id,
          v_updated_at,
          v_exec_status_id,
          v_tl_id,
          r.summary,
          r.pending_items,
          CASE WHEN LOWER(TRIM(r.has_stopper_value)) = 'true' THEN 'Y' ELSE 'N' END,
          r.stopper_desc,
          NULLIF(r.stopper_owner, ''),
          v_impact_id,
          r.relevant_risks,
          NULLIF(r.next_milestone, ''),
          v_next_milestone_date,
          r.pending_decisions,
          CASE WHEN LOWER(TRIM(r.requires_coord_value)) = 'true' THEN 'Y' ELSE 'N' END,
          r.coordination_desc,
          v_resp_area_id,
          r.responsible_action,
          r.additional_notes
        );

        map_entity(v_batch_id, 'project_update', r.legacy_id, 'project_update', v_id);
        v_success := v_success + 1;
      EXCEPTION
        WHEN OTHERS THEN
          log_error(v_batch_id, 'project_update', r.legacy_id, TO_CHAR(SQLCODE), SQLERRM, '$.projectUpdates');
      END;
      v_total := v_total + 1;
    END LOOP;

    -- Kanban
    FOR r IN (
      SELECT jt.*
      FROM JSON_TABLE(v_json, '$.kanban[*]'
        COLUMNS (
          legacy_id VARCHAR2(100 CHAR) PATH '$.id',
          text CLOB PATH '$.text',
          area_code VARCHAR2(30 CHAR) PATH '$.area',
          priority_code VARCHAR2(30 CHAR) PATH '$.priority',
          status_code VARCHAR2(30 CHAR) PATH '$.status',
          due_date_value VARCHAR2(30 CHAR) PATH '$.dueDate',
          reminder_value VARCHAR2(80 CHAR) PATH '$.reminder',
          project_legacy_id VARCHAR2(100 CHAR) PATH '$.projectId',
          created_at_value VARCHAR2(80 CHAR) PATH '$.createdAt'
        )
      ) jt
    ) LOOP
      DECLARE
        v_id NUMBER(19,0);
        v_area_id NUMBER(19,0);
        v_priority_id NUMBER(19,0);
        v_status_id NUMBER(19,0);
        v_project_id NUMBER(19,0);
        v_due_date DATE;
        v_reminder_at TIMESTAMP WITH TIME ZONE;
        v_created_at_original TIMESTAMP WITH TIME ZONE;
      BEGIN
        SELECT seq_kanban_card.NEXTVAL INTO v_id FROM dual;

        SELECT work_area_id INTO v_area_id FROM work_area WHERE legacy_code = r.area_code;
        SELECT priority_level_id INTO v_priority_id FROM priority_level WHERE legacy_code = r.priority_code;
        SELECT kanban_status_id INTO v_status_id FROM kanban_status WHERE legacy_code = r.status_code;

        IF NULLIF(TRIM(r.project_legacy_id), '') IS NOT NULL THEN
          SELECT new_entity_id INTO v_project_id
          FROM legacy_id_map
          WHERE migration_batch_id = v_batch_id
            AND entity_type = 'project'
            AND legacy_id = r.project_legacy_id;
        END IF;

        IF NULLIF(TRIM(r.due_date_value), '') IS NOT NULL THEN
          v_due_date := TO_DATE(r.due_date_value, 'YYYY-MM-DD');
        END IF;

        IF NULLIF(TRIM(r.reminder_value), '') IS NOT NULL THEN
          SELECT FROM_TZ(
                   TO_TIMESTAMP(r.reminder_value, 'YYYY-MM-DD"T"HH24:MI'),
                   SESSIONTIMEZONE
                 )
          INTO v_reminder_at
          FROM dual;
        END IF;

        IF NULLIF(TRIM(r.created_at_value), '') IS NOT NULL THEN
          v_created_at_original := TO_TIMESTAMP_TZ(
            REPLACE(r.created_at_value, 'Z', '+00:00'),
            'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM'
          );
        END IF;

        INSERT INTO kanban_card (
          kanban_card_id, legacy_id, text, work_area_id, priority_level_id,
          kanban_status_id, due_date, reminder_at, project_id, created_at_original
        ) VALUES (
          v_id,
          r.legacy_id,
          r.text,
          v_area_id,
          v_priority_id,
          v_status_id,
          v_due_date,
          v_reminder_at,
          v_project_id,
          v_created_at_original
        );

        map_entity(v_batch_id, 'kanban_card', r.legacy_id, 'kanban_card', v_id);
        v_success := v_success + 1;
      EXCEPTION
        WHEN OTHERS THEN
          log_error(v_batch_id, 'kanban_card', r.legacy_id, TO_CHAR(SQLCODE), SQLERRM, '$.kanban');
      END;
      v_total := v_total + 1;
    END LOOP;

    -- Logs
    FOR r IN (
      SELECT jt.*
      FROM JSON_TABLE(v_json, '$.logs[*]'
        COLUMNS (
          legacy_id VARCHAR2(100 CHAR) PATH '$.id',
          text CLOB PATH '$.text',
          area_code VARCHAR2(30 CHAR) PATH '$.area',
          ts_value VARCHAR2(80 CHAR) PATH '$.ts'
        )
      ) jt
    ) LOOP
      DECLARE
        v_id NUMBER(19,0);
        v_area_id NUMBER(19,0);
        v_logged_at TIMESTAMP WITH TIME ZONE;
      BEGIN
        SELECT seq_activity_log.NEXTVAL INTO v_id FROM dual;
        SELECT work_area_id INTO v_area_id FROM work_area WHERE legacy_code = r.area_code;

        v_logged_at := TO_TIMESTAMP_TZ(
          REPLACE(r.ts_value, 'Z', '+00:00'),
          'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM'
        );

        INSERT INTO activity_log (
          activity_log_id, legacy_id, text, work_area_id, logged_at_original
        ) VALUES (
          v_id, r.legacy_id, r.text, v_area_id, v_logged_at
        );

        map_entity(v_batch_id, 'activity_log', r.legacy_id, 'activity_log', v_id);
        v_success := v_success + 1;
      EXCEPTION
        WHEN OTHERS THEN
          log_error(v_batch_id, 'activity_log', r.legacy_id, TO_CHAR(SQLCODE), SQLERRM, '$.logs');
      END;
      v_total := v_total + 1;
    END LOOP;

    -- OKRs
    FOR o IN (
      SELECT jt.*
      FROM JSON_TABLE(v_json, '$.okrs[*]'
        COLUMNS (
          okr_ord FOR ORDINALITY,
          legacy_id VARCHAR2(100 CHAR) PATH '$.id',
          name VARCHAR2(1000 CHAR) PATH '$.name'
        )
      ) jt
    ) LOOP
      DECLARE
        v_okr_id NUMBER(19,0);
      BEGIN
        SELECT seq_okr.NEXTVAL INTO v_okr_id FROM dual;

        INSERT INTO okr (okr_id, legacy_id, name, sort_order)
        VALUES (v_okr_id, o.legacy_id, o.name, o.okr_ord);

        map_entity(v_batch_id, 'okr', o.legacy_id, 'okr', v_okr_id);
        v_success := v_success + 1;

        FOR a IN (
          SELECT jt.*
          FROM JSON_TABLE(v_json, '$.okrs[*]'
            COLUMNS (
              parent_legacy_id VARCHAR2(100 CHAR) PATH '$.id',
              NESTED PATH '$.activities[*]'
              COLUMNS (
                activity_ord FOR ORDINALITY,
                legacy_id VARCHAR2(100 CHAR) PATH '$.id',
                pct NUMBER PATH '$.pct',
                status_name VARCHAR2(150 CHAR) PATH '$.status',
                text CLOB PATH '$.text',
                resp VARCHAR2(250 CHAR) PATH '$.resp',
                dep VARCHAR2(500 CHAR) PATH '$.dep',
                salida CLOB PATH '$.salida'
              )
            )
          ) jt
          WHERE jt.parent_legacy_id = o.legacy_id
        ) LOOP
          DECLARE
            v_activity_id NUMBER(19,0);
            v_status_id NUMBER(19,0);
          BEGIN
            SELECT seq_okr_activity.NEXTVAL INTO v_activity_id FROM dual;
            SELECT okr_activity_status_id INTO v_status_id
            FROM okr_activity_status
            WHERE name = a.status_name;

            INSERT INTO okr_activity (
              okr_activity_id, okr_id, legacy_id, pct, status_id, text,
              responsible, dependency, deliverable, sort_order
            ) VALUES (
              v_activity_id,
              v_okr_id,
              a.legacy_id,
              NVL(a.pct, 0),
              v_status_id,
              a.text,
              NULLIF(a.resp, ''),
              NULLIF(a.dep, ''),
              a.salida,
              a.activity_ord
            );

            map_entity(v_batch_id, 'okr_activity', o.legacy_id || ':' || a.legacy_id, 'okr_activity', v_activity_id);
            v_success := v_success + 1;

            FOR m IN (
              SELECT jt.*
              FROM JSON_TABLE(v_json, '$.okrs[*]'
                COLUMNS (
                  parent_okr_id VARCHAR2(100 CHAR) PATH '$.id',
                  NESTED PATH '$.activities[*]'
                  COLUMNS (
                    parent_activity_id VARCHAR2(100 CHAR) PATH '$.id',
                    NESTED PATH '$.metas[*]'
                    COLUMNS (
                      milestone_ord FOR ORDINALITY,
                      q VARCHAR2(20 CHAR) PATH '$.q',
                      label VARCHAR2(30 CHAR) PATH '$.label',
                      mes VARCHAR2(20 CHAR) PATH '$.mes',
                      pct NUMBER PATH '$.pct'
                    )
                  )
                )
              ) jt
              WHERE jt.parent_okr_id = o.legacy_id
                AND jt.parent_activity_id = a.legacy_id
            ) LOOP
              INSERT INTO okr_activity_milestone (
                okr_activity_milestone_id, okr_activity_id, quarter_code,
                quarter_label, month_abbr, pct, sort_order
              ) VALUES (
                seq_okr_activity_milestone.NEXTVAL,
                v_activity_id,
                m.q,
                m.label,
                m.mes,
                NVL(m.pct, 0),
                m.milestone_ord
              );
              v_success := v_success + 1;
            END LOOP;
          EXCEPTION
            WHEN OTHERS THEN
              log_error(v_batch_id, 'okr_activity', o.legacy_id || ':' || a.legacy_id, TO_CHAR(SQLCODE), SQLERRM, '$.okrs.activities');
          END;
        END LOOP;
      EXCEPTION
        WHEN OTHERS THEN
          log_error(v_batch_id, 'okr', o.legacy_id, TO_CHAR(SQLCODE), SQLERRM, '$.okrs');
      END;
      v_total := v_total + 1;
    END LOOP;

    SELECT COUNT(*)
    INTO v_error_count
    FROM migration_error
    WHERE migration_batch_id = v_batch_id;

    UPDATE migration_batch
    SET total_records = v_total,
        success_records = v_success,
        error_records = v_error_count,
        status = CASE WHEN v_error_count = 0 THEN 'COMPLETED' ELSE 'COMPLETED_WITH_ERRORS' END,
        finished_at = SYSTIMESTAMP,
        updated_at = SYSTIMESTAMP
    WHERE migration_batch_id = v_batch_id;

    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      IF v_batch_id IS NOT NULL THEN
        UPDATE migration_batch
        SET status = 'FAILED',
            finished_at = SYSTIMESTAMP,
            updated_at = SYSTIMESTAMP,
            error_records = error_records + 1
        WHERE migration_batch_id = v_batch_id;
        COMMIT;
      END IF;
      RAISE;
  END import_backup;

  PROCEDURE rollback_batch(p_migration_batch_id IN NUMBER) IS
  BEGIN
    EXECUTE IMMEDIATE 'ALTER TRIGGER trg_project_update_no_delete DISABLE';

    DELETE FROM notification_reminder
    WHERE kanban_card_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'kanban_card'
    )
    OR project_update_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'project_update'
    );

    DELETE FROM okr_activity_milestone
    WHERE okr_activity_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'okr_activity'
    );

    DELETE FROM okr_activity
    WHERE okr_activity_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'okr_activity'
    );

    DELETE FROM okr
    WHERE okr_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'okr'
    );

    DELETE FROM activity_log
    WHERE activity_log_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'activity_log'
    );

    DELETE FROM kanban_card
    WHERE kanban_card_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'kanban_card'
    );

    DELETE FROM project_update
    WHERE project_update_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'project_update'
    );

    DELETE FROM project_assignment
    WHERE project_assignment_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'project_assignment'
    );

    DELETE FROM team_member
    WHERE team_member_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'team_member'
    );

    DELETE FROM project
    WHERE project_id IN (
      SELECT new_entity_id FROM legacy_id_map
      WHERE migration_batch_id = p_migration_batch_id AND entity_type = 'project'
    );

    DELETE FROM legacy_id_map WHERE migration_batch_id = p_migration_batch_id;
    DELETE FROM migration_error WHERE migration_batch_id = p_migration_batch_id;
    DELETE FROM stg_legacy_backup WHERE migration_batch_id = p_migration_batch_id;
    DELETE FROM migration_batch WHERE migration_batch_id = p_migration_batch_id;

    EXECUTE IMMEDIATE 'ALTER TRIGGER trg_project_update_no_delete ENABLE';
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      BEGIN
        EXECUTE IMMEDIATE 'ALTER TRIGGER trg_project_update_no_delete ENABLE';
      EXCEPTION
        WHEN OTHERS THEN
          NULL;
      END;
      ROLLBACK;
      RAISE;
  END rollback_batch;
END pkg_legacy_json_migration;
/

DECLARE
  v_error_count NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_error_count
  FROM user_errors
  WHERE name = 'PKG_LEGACY_JSON_MIGRATION'
    AND type IN ('PACKAGE', 'PACKAGE BODY');

  IF v_error_count > 0 THEN
    RAISE_APPLICATION_ERROR(-20999, 'pkg_legacy_json_migration has compilation errors. Query USER_ERRORS for details.');
  END IF;
END;
/
