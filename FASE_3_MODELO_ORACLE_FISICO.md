# FASE 3 - Modelo relacional Oracle fisico detallado

## 1. Objetivo

Definir el modelo fisico Oracle 19c de la nueva plataforma enterprise antes de generar scripts SQL ejecutables. Esta fase valida tablas, columnas, tipos Oracle, PK/FK, constraints, indices, sequences, auditoria transversal, normalizacion y estrategia append-only.

No se genera frontend ni backend en esta fase.

## 2. Convenciones fisicas Oracle

### 2.1 Naming

- Tablas: singular snake_case.
- PK: `<tabla>_id`.
- FK: `<tabla_referenciada>_id`.
- Sequences: `seq_<tabla>`.
- PK constraints: `pk_<tabla>`.
- FK constraints: `fk_<tabla>__<referencia>`.
- Unique constraints: `uk_<tabla>__<columnas>`.
- Check constraints: `ck_<tabla>__<regla>`.
- Indexes: `ix_<tabla>__<columnas>`.

### 2.2 Tipos Oracle recomendados

- IDs relacionales: `NUMBER(19,0)`.
- Legacy IDs: `VARCHAR2(100 CHAR)`.
- Codigos de catalogo: `VARCHAR2(60 CHAR)`.
- Nombres: `VARCHAR2(200 CHAR)`.
- Descripciones cortas: `VARCHAR2(500 CHAR)`.
- Textos funcionales largos: `CLOB`.
- Fechas con hora: `TIMESTAMP(6) WITH TIME ZONE`.
- Fechas sin hora: `DATE`.
- Booleanos: `CHAR(1)` con check `Y/N`.
- Porcentajes: `NUMBER(5,2)` o `NUMBER(3,0)` segun caso.
- Hashes: `VARCHAR2(128 CHAR)`.
- IP: `VARCHAR2(64 CHAR)`.
- User agent: `VARCHAR2(500 CHAR)`.

### 2.3 Regla para CLOB

Se permite `CLOB` para texto libre funcional:

- resumenes
- riesgos
- bitacoras
- notas
- descripciones largas

No se permite `CLOB` ni JSON para guardar estructuras funcionales complejas que deban consultarse relacionalmente. OKRs, metas, asignaciones, permisos y updates deben estar normalizados.

## 3. Auditoria transversal

### 3.1 Columnas auditables estandar

Tablas funcionales principales:

- `created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL`
- `updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL`
- `created_by NUMBER(19,0) NULL`
- `updated_by NUMBER(19,0) NULL`
- `is_deleted CHAR(1) DEFAULT 'N' NOT NULL`
- `deleted_at TIMESTAMP(6) WITH TIME ZONE NULL`
- `deleted_by NUMBER(19,0) NULL`

Checks:

- `is_deleted IN ('Y','N')`
- si `is_deleted = 'N'`, `deleted_at` debe ser null.

### 3.2 Auditoria tecnica vs historico funcional

- Auditoria tecnica registra quien creo/actualizo/eliminó logicamente.
- Historico funcional vive en `project_update` y no se sobrescribe.
- `project_update.updated_at_original` representa el momento funcional de la actualizacion.
- `project_update.created_at` representa el momento tecnico en el que el registro se inserto en Oracle.

### 3.3 FKs de auditoria

`created_by`, `updated_by` y `deleted_by` pueden referenciar `app_user(user_id)`, pero se recomienda permitir null para:

- datos migrados antes de crear usuarios nominales
- cargas tecnicas
- contingencia de migracion

## 4. Estrategia de claves

### 4.1 PK relacional

Todas las tablas de negocio usan PK tecnica `NUMBER(19,0)` alimentada por sequence.

Ejemplo:

- `project.project_id`
- `project_update.project_update_id`
- `team_member.team_member_id`

### 4.2 Legacy ID

Cada entidad migrable conserva `legacy_id VARCHAR2(100 CHAR)`.

Reglas:

- No se usa como PK.
- Se indexa y, cuando sea seguro por entidad, se define unique.
- Preserva IDs JS/localStorage exactos.
- Permite conciliacion JSON -> Oracle.

### 4.3 Mapa legacy

`legacy_id_map` conserva equivalencias entre:

- batch de migracion
- tipo de entidad legacy
- legacy id original
- tabla destino
- nuevo ID relacional

Esto evita depender exclusivamente de `legacy_id` embebido en cada tabla y permite auditar migraciones multiples.

## 5. Catalogos normalizados

Los catalogos deben cargarse antes de entidades funcionales.

### 5.1 Estructura comun de catalogo

Columnas comunes:

- `<catalog>_id NUMBER(19,0) PK`
- `code VARCHAR2(60 CHAR) NOT NULL`
- `name VARCHAR2(150 CHAR) NOT NULL`
- `description VARCHAR2(500 CHAR) NULL`
- `sort_order NUMBER(5,0) DEFAULT 0 NOT NULL`
- `active CHAR(1) DEFAULT 'Y' NOT NULL`
- auditoria transversal

Constraints comunes:

- unique `code`
- check `active IN ('Y','N')`

### 5.2 `pipeline_status`

Valores iniciales:

- `DESARROLLO` -> `Desarrollo`
- `PLANEACION` -> `Planeación`
- `REVISION` -> `Revisión`
- `RECEPCION_HUS` -> `Recepción Hus`
- `CERTIFICACION` -> `Certificación`
- `PAUSADO` -> `Pausado`
- `FINALIZADO` -> `Finalizado`
- `SIN_INFORMACION` -> `Sin información`

### 5.3 `executive_status`

Valores iniciales:

- `EN_CURSO`
- `EN_RIESGO`
- `BLOQUEADO`
- `REQUIERE_DECISION`
- `COMPLETADO`

### 5.4 `traffic_light`

Valores iniciales:

- `GRIS`
- `VERDE`
- `AMARILLO`
- `ROJO`

### 5.5 `work_area`

Valores iniciales:

- `PLAN`
- `EXEC`
- `STAKE`
- `TRANS`
- `CIERRE`
- `COTIDIANA`
- `SEGUIMIENTO`

Debe preservar tambien el codigo legacy:

- `legacy_code VARCHAR2(30 CHAR) NOT NULL`

Ejemplo:

- `PLAN` con `legacy_code = 'plan'`
- `EXEC` con `legacy_code = 'exec'`

### 5.6 `kanban_status`

Valores iniciales:

- `PENDIENTE`
- `EN_CURSO`
- `HECHO`

Preservar legacy:

- `legacy_code`: `pendiente`, `en-curso`, `hecho`

### 5.7 `priority_level`

Valores iniciales:

- `ALTA`
- `MEDIA`
- `BAJA`

Preservar legacy:

- `legacy_code`: `alta`, `media`, `baja`

### 5.8 `stopper_impact`

Valores iniciales:

- `BAJO`
- `MEDIO`
- `ALTO`
- `CRITICO`

### 5.9 `responsible_area`

Valores iniciales:

- `COORDINACION`
- `DIRECCION`
- `GERENCIA`
- `DELIVERY_MANAGER`
- `PRODUCT_DELIVERY`
- `FUNCIONAL`

### 5.10 `tech_role`

Valores iniciales:

- `LIDER_TECNICO`
- `BE_JAVA`
- `BE_BASE_DATOS`
- `BE_DATA_SCIENCE`
- `FRONTEND`
- `DOT_NET`
- `QA`
- `DEVOPS`
- `OTRO`

### 5.11 `okr_activity_status`

Valores iniciales:

- `PENDIENTE`
- `EN_CURSO`
- `COMPLETADO`
- `BLOQUEADO`

## 6. Seguridad RBAC

### 6.1 `app_user`

Columnas:

- `user_id NUMBER(19,0) PK`
- `username VARCHAR2(80 CHAR) NOT NULL`
- `email VARCHAR2(150 CHAR) NOT NULL`
- `password_hash VARCHAR2(255 CHAR) NOT NULL`
- `full_name VARCHAR2(200 CHAR) NOT NULL`
- `active CHAR(1) DEFAULT 'Y' NOT NULL`
- `last_login_at TIMESTAMP(6) WITH TIME ZONE NULL`
- auditoria transversal

Constraints:

- `uk_app_user__username`
- `uk_app_user__email`
- `ck_app_user__active`

Indices:

- `ix_app_user__active`

### 6.2 `role`

Columnas:

- `role_id NUMBER(19,0) PK`
- `code VARCHAR2(60 CHAR) NOT NULL`
- `name VARCHAR2(150 CHAR) NOT NULL`
- `description VARCHAR2(500 CHAR) NULL`
- `active CHAR(1) DEFAULT 'Y' NOT NULL`
- auditoria transversal

Constraints:

- unique `code`
- check `active`

### 6.3 `permission`

Columnas:

- `permission_id NUMBER(19,0) PK`
- `code VARCHAR2(100 CHAR) NOT NULL`
- `module VARCHAR2(60 CHAR) NOT NULL`
- `action VARCHAR2(60 CHAR) NOT NULL`
- `description VARCHAR2(500 CHAR) NULL`
- `active CHAR(1) DEFAULT 'Y' NOT NULL`
- auditoria transversal

Constraints:

- unique `code`
- unique `(module, action)`

### 6.4 `user_role`

Columnas:

- `user_role_id NUMBER(19,0) PK`
- `user_id NUMBER(19,0) NOT NULL`
- `role_id NUMBER(19,0) NOT NULL`
- auditoria transversal

Constraints:

- FK `user_id -> app_user`
- FK `role_id -> role`
- unique `(user_id, role_id)`

### 6.5 `role_permission`

Columnas:

- `role_permission_id NUMBER(19,0) PK`
- `role_id NUMBER(19,0) NOT NULL`
- `permission_id NUMBER(19,0) NOT NULL`
- auditoria transversal

Constraints:

- FK `role_id -> role`
- FK `permission_id -> permission`
- unique `(role_id, permission_id)`

### 6.6 `auth_refresh_token`

Columnas:

- `refresh_token_id NUMBER(19,0) PK`
- `user_id NUMBER(19,0) NOT NULL`
- `token_hash VARCHAR2(255 CHAR) NOT NULL`
- `issued_at TIMESTAMP(6) WITH TIME ZONE NOT NULL`
- `expires_at TIMESTAMP(6) WITH TIME ZONE NOT NULL`
- `revoked_at TIMESTAMP(6) WITH TIME ZONE NULL`
- `ip_address VARCHAR2(64 CHAR) NULL`
- `user_agent VARCHAR2(500 CHAR) NULL`
- auditoria transversal

Constraints:

- FK `user_id -> app_user`
- unique `token_hash`

Indices:

- `ix_auth_refresh_token__user`
- `ix_auth_refresh_token__expires`

## 7. Portafolio y equipos

### 7.1 `project`

Columnas:

- `project_id NUMBER(19,0) PK`
- `legacy_id VARCHAR2(100 CHAR) NULL`
- `name VARCHAR2(250 CHAR) NOT NULL`
- `pipeline_status_id NUMBER(19,0) NOT NULL`
- `start_date DATE NULL`
- `legacy_updated_at TIMESTAMP(6) WITH TIME ZONE NULL`
- `is_ghost CHAR(1) DEFAULT 'N' NOT NULL`
- auditoria transversal

Constraints:

- FK `pipeline_status_id -> pipeline_status`
- `uk_project__legacy_id` cuando `legacy_id` no sea null.
- check `is_ghost IN ('Y','N')`

Indices:

- `ix_project__pipeline_status`
- `ix_project__legacy_updated_at`
- `ix_project__is_deleted`
- `ix_project__name`

Comentarios:

- `legacy_updated_at` conserva `projects.updatedAt` del JSON.
- El estado ejecutivo actual no vive aqui; se deriva de `project_update`.

### 7.2 `team_member`

Columnas:

- `team_member_id NUMBER(19,0) PK`
- `legacy_id VARCHAR2(100 CHAR) NULL`
- `name VARCHAR2(200 CHAR) NOT NULL`
- `default_role_id NUMBER(19,0) NULL`
- `email VARCHAR2(150 CHAR) NULL`
- `active CHAR(1) DEFAULT 'Y' NOT NULL`
- `notes CLOB NULL`
- auditoria transversal

Constraints:

- FK `default_role_id -> tech_role`
- unique `legacy_id`
- check `active IN ('Y','N')`

Indices:

- `ix_team_member__default_role`
- `ix_team_member__active`
- `ix_team_member__name`

### 7.3 `project_assignment`

Columnas:

- `project_assignment_id NUMBER(19,0) PK`
- `legacy_id VARCHAR2(100 CHAR) NULL`
- `project_id NUMBER(19,0) NOT NULL`
- `team_member_id NUMBER(19,0) NOT NULL`
- `role_id NUMBER(19,0) NOT NULL`
- `is_lead CHAR(1) DEFAULT 'N' NOT NULL`
- `valid_from TIMESTAMP(6) WITH TIME ZONE NULL`
- `valid_to TIMESTAMP(6) WITH TIME ZONE NULL`
- auditoria transversal

Constraints:

- FK `project_id -> project`
- FK `team_member_id -> team_member`
- FK `role_id -> tech_role`
- unique `legacy_id`
- check `is_lead IN ('Y','N')`
- check `valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from`

Indices:

- `ix_project_assignment__project`
- `ix_project_assignment__member`
- `ix_project_assignment__role`
- `ix_project_assignment__lead`

Regla de liderazgo:

- Oracle no soporta indices parciales igual que PostgreSQL.
- Estrategia recomendada: indice unico basado en funcion para un solo lider activo por proyecto:
  - unique sobre `CASE WHEN is_lead = 'Y' AND is_deleted = 'N' AND valid_to IS NULL THEN project_id END`
- Alternativa: validacion transaccional en backend y constraint diferido mediante trigger.

## 8. Seguimiento ejecutivo append-only

### 8.1 `project_update`

Columnas:

- `project_update_id NUMBER(19,0) PK`
- `legacy_id VARCHAR2(100 CHAR) NULL`
- `project_id NUMBER(19,0) NOT NULL`
- `updated_at_original TIMESTAMP(6) WITH TIME ZONE NOT NULL`
- `executive_status_id NUMBER(19,0) NOT NULL`
- `traffic_light_id NUMBER(19,0) NOT NULL`
- `summary CLOB NOT NULL`
- `pending_items CLOB NULL`
- `has_stopper CHAR(1) DEFAULT 'N' NOT NULL`
- `stopper_desc CLOB NULL`
- `stopper_owner VARCHAR2(250 CHAR) NULL`
- `stopper_impact_id NUMBER(19,0) NULL`
- `relevant_risks CLOB NULL`
- `next_milestone VARCHAR2(500 CHAR) NULL`
- `next_milestone_date DATE NULL`
- `pending_decisions CLOB NULL`
- `requires_coordination CHAR(1) DEFAULT 'N' NOT NULL`
- `coordination_desc CLOB NULL`
- `responsible_area_id NUMBER(19,0) NULL`
- `responsible_action CLOB NULL`
- `additional_notes CLOB NULL`
- auditoria transversal, pero sin update funcional regular

Constraints:

- FK `project_id -> project`
- FK `executive_status_id -> executive_status`
- FK `traffic_light_id -> traffic_light`
- FK `stopper_impact_id -> stopper_impact`
- FK `responsible_area_id -> responsible_area`
- unique `legacy_id`
- check `has_stopper IN ('Y','N')`
- check `requires_coordination IN ('Y','N')`
- check `requires_coordination = 'N' OR coordination_desc IS NOT NULL`
- check `has_stopper = 'N' OR stopper_desc IS NOT NULL OR stopper_owner IS NOT NULL OR stopper_impact_id IS NOT NULL`

Indices:

- `ix_project_update__project_date` sobre `(project_id, updated_at_original DESC)`
- `ix_project_update__traffic_light`
- `ix_project_update__executive_status`
- `ix_project_update__coordination`
- `ix_project_update__stopper`
- `ix_project_update__milestone_date`
- `ix_project_update__legacy_id`

### 8.2 Estrategia append-only

Reglas:

- No exponer actualizacion funcional de `project_update`.
- El backend solo debe permitir `INSERT`.
- Correcciones deben hacerse con un nuevo `project_update` o con evento de auditoria administrativo.
- El modelo conserva `is_deleted` solo para ocultamiento administrativo excepcional, no para operacion normal.

Proteccion fisica recomendada:

- Trigger `before update` sobre `project_update` que bloquee cambios a columnas funcionales.
- Permitir solamente cambios tecnicos controlados como `is_deleted`, `deleted_at`, `deleted_by` si el rol administrativo lo requiere.
- Otra opcion: revocar permisos `UPDATE` sobre tabla al usuario aplicativo y canalizar todo por procedimientos controlados.

### 8.3 Reconstruccion historica

Consulta logica:

1. Filtrar updates por `project_id`.
2. `updated_at_original <= :fecha_corte`.
3. Ordenar `updated_at_original DESC`.
4. Tomar primer registro.

Indice soporte:

- `(project_id, updated_at_original DESC)`

### 8.4 Vista recomendada `vw_project_current_status`

Vista logica:

- Ultimo `project_update` no eliminado por proyecto.
- Expone proyecto, estado ejecutivo, semaforo, ultima fecha, coordinacion, stopper, hito.

No reemplaza la tabla historica.

## 9. Work management

### 9.1 `kanban_card`

Columnas:

- `kanban_card_id NUMBER(19,0) PK`
- `legacy_id VARCHAR2(100 CHAR) NULL`
- `text CLOB NOT NULL`
- `work_area_id NUMBER(19,0) NOT NULL`
- `priority_level_id NUMBER(19,0) NOT NULL`
- `kanban_status_id NUMBER(19,0) NOT NULL`
- `due_date DATE NULL`
- `reminder_at TIMESTAMP(6) WITH TIME ZONE NULL`
- `project_id NUMBER(19,0) NULL`
- `created_at_original TIMESTAMP(6) WITH TIME ZONE NULL`
- auditoria transversal

Constraints:

- FK `work_area_id -> work_area`
- FK `priority_level_id -> priority_level`
- FK `kanban_status_id -> kanban_status`
- FK `project_id -> project`
- unique `legacy_id`

Indices:

- `ix_kanban_card__status`
- `ix_kanban_card__priority`
- `ix_kanban_card__area`
- `ix_kanban_card__due_date`
- `ix_kanban_card__reminder`
- `ix_kanban_card__project`

### 9.2 `notification_reminder`

Columnas:

- `notification_reminder_id NUMBER(19,0) PK`
- `kanban_card_id NUMBER(19,0) NULL`
- `project_update_id NUMBER(19,0) NULL`
- `reminder_at TIMESTAMP(6) WITH TIME ZONE NOT NULL`
- `status VARCHAR2(30 CHAR) DEFAULT 'PENDING' NOT NULL`
- `sent_at TIMESTAMP(6) WITH TIME ZONE NULL`
- `channel VARCHAR2(30 CHAR) DEFAULT 'IN_APP' NOT NULL`
- auditoria transversal

Constraints:

- FK `kanban_card_id -> kanban_card`
- FK `project_update_id -> project_update`
- check `status IN ('PENDING','SENT','CANCELLED','FAILED')`
- check `channel IN ('IN_APP','EMAIL')`
- check al menos una referencia: `kanban_card_id IS NOT NULL OR project_update_id IS NOT NULL`

Indices:

- `ix_notification_reminder__status_time`
- `ix_notification_reminder__kanban`
- `ix_notification_reminder__project_update`

## 10. Bitacora

### 10.1 `activity_log`

Columnas:

- `activity_log_id NUMBER(19,0) PK`
- `legacy_id VARCHAR2(100 CHAR) NULL`
- `text CLOB NOT NULL`
- `work_area_id NUMBER(19,0) NOT NULL`
- `logged_at_original TIMESTAMP(6) WITH TIME ZONE NOT NULL`
- auditoria transversal

Constraints:

- FK `work_area_id -> work_area`
- unique `legacy_id`

Indices:

- `ix_activity_log__logged_at`
- `ix_activity_log__area`
- `ix_activity_log__legacy_id`

## 11. OKR management

### 11.1 `okr`

Columnas:

- `okr_id NUMBER(19,0) PK`
- `legacy_id VARCHAR2(100 CHAR) NULL`
- `name VARCHAR2(1000 CHAR) NOT NULL`
- `sort_order NUMBER(5,0) DEFAULT 0 NOT NULL`
- auditoria transversal

Constraints:

- unique `legacy_id`

Indices:

- `ix_okr__sort_order`

### 11.2 `okr_activity`

Columnas:

- `okr_activity_id NUMBER(19,0) PK`
- `okr_id NUMBER(19,0) NOT NULL`
- `legacy_id VARCHAR2(100 CHAR) NULL`
- `pct NUMBER(5,2) DEFAULT 0 NOT NULL`
- `status_id NUMBER(19,0) NOT NULL`
- `text CLOB NOT NULL`
- `responsible VARCHAR2(250 CHAR) NULL`
- `dependency VARCHAR2(500 CHAR) NULL`
- `deliverable CLOB NULL`
- `sort_order NUMBER(5,0) DEFAULT 0 NOT NULL`
- auditoria transversal

Constraints:

- FK `okr_id -> okr`
- FK `status_id -> okr_activity_status`
- unique `(okr_id, legacy_id)`
- check `pct >= 0 AND pct <= 100`

Indices:

- `ix_okr_activity__okr`
- `ix_okr_activity__status`
- `ix_okr_activity__sort_order`

### 11.3 `okr_activity_milestone`

Columnas:

- `okr_activity_milestone_id NUMBER(19,0) PK`
- `okr_activity_id NUMBER(19,0) NOT NULL`
- `quarter_code VARCHAR2(20 CHAR) NOT NULL`
- `quarter_label VARCHAR2(30 CHAR) NOT NULL`
- `month_abbr VARCHAR2(20 CHAR) NOT NULL`
- `pct NUMBER(5,2) NOT NULL`
- `sort_order NUMBER(5,0) DEFAULT 0 NOT NULL`
- auditoria transversal

Constraints:

- FK `okr_activity_id -> okr_activity`
- check `pct >= 0 AND pct <= 100`

Indices:

- `ix_okr_activity_milestone__activity`
- `ix_okr_activity_milestone__quarter`

## 12. Migracion y trazabilidad

### 12.1 `migration_batch`

Columnas:

- `migration_batch_id NUMBER(19,0) PK`
- `source_file_name VARCHAR2(300 CHAR) NOT NULL`
- `source_version VARCHAR2(30 CHAR) NULL`
- `exported_at TIMESTAMP(6) WITH TIME ZONE NULL`
- `exported_date_label VARCHAR2(200 CHAR) NULL`
- `status VARCHAR2(30 CHAR) NOT NULL`
- `total_records NUMBER(10,0) DEFAULT 0 NOT NULL`
- `success_records NUMBER(10,0) DEFAULT 0 NOT NULL`
- `error_records NUMBER(10,0) DEFAULT 0 NOT NULL`
- `started_at TIMESTAMP(6) WITH TIME ZONE NOT NULL`
- `finished_at TIMESTAMP(6) WITH TIME ZONE NULL`
- auditoria transversal

Constraints:

- check `status IN ('PENDING','RUNNING','COMPLETED','FAILED','COMPLETED_WITH_ERRORS')`

Indices:

- `ix_migration_batch__status`
- `ix_migration_batch__started_at`

### 12.2 `legacy_id_map`

Columnas:

- `legacy_id_map_id NUMBER(19,0) PK`
- `migration_batch_id NUMBER(19,0) NOT NULL`
- `entity_type VARCHAR2(80 CHAR) NOT NULL`
- `legacy_id VARCHAR2(100 CHAR) NOT NULL`
- `new_entity_table VARCHAR2(80 CHAR) NOT NULL`
- `new_entity_id NUMBER(19,0) NOT NULL`
- `notes VARCHAR2(500 CHAR) NULL`
- auditoria transversal

Constraints:

- FK `migration_batch_id -> migration_batch`
- unique `(migration_batch_id, entity_type, legacy_id)`

Indices:

- `ix_legacy_id_map__entity_legacy`
- `ix_legacy_id_map__new_entity`

### 12.3 `migration_error`

Columnas:

- `migration_error_id NUMBER(19,0) PK`
- `migration_batch_id NUMBER(19,0) NOT NULL`
- `entity_type VARCHAR2(80 CHAR) NULL`
- `legacy_id VARCHAR2(100 CHAR) NULL`
- `error_code VARCHAR2(80 CHAR) NOT NULL`
- `error_message VARCHAR2(1000 CHAR) NOT NULL`
- `raw_path VARCHAR2(500 CHAR) NULL`
- `created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL`

Constraints:

- FK `migration_batch_id -> migration_batch`

Indices:

- `ix_migration_error__batch`
- `ix_migration_error__entity`

## 13. Auditoria de eventos

### 13.1 `audit_event`

Columnas:

- `audit_event_id NUMBER(19,0) PK`
- `event_type VARCHAR2(80 CHAR) NOT NULL`
- `entity_name VARCHAR2(80 CHAR) NULL`
- `entity_id NUMBER(19,0) NULL`
- `legacy_id VARCHAR2(100 CHAR) NULL`
- `action VARCHAR2(80 CHAR) NOT NULL`
- `summary VARCHAR2(1000 CHAR) NULL`
- `before_hash VARCHAR2(128 CHAR) NULL`
- `after_hash VARCHAR2(128 CHAR) NULL`
- `performed_by NUMBER(19,0) NULL`
- `performed_at TIMESTAMP(6) WITH TIME ZONE NOT NULL`
- `ip_address VARCHAR2(64 CHAR) NULL`
- `user_agent VARCHAR2(500 CHAR) NULL`

Constraints:

- FK `performed_by -> app_user`

Indices:

- `ix_audit_event__performed_at`
- `ix_audit_event__entity`
- `ix_audit_event__performed_by`
- `ix_audit_event__event_type`

## 14. Relaciones principales

### 14.1 Portafolio

- `project.pipeline_status_id -> pipeline_status.pipeline_status_id`
- `project_assignment.project_id -> project.project_id`
- `project_assignment.team_member_id -> team_member.team_member_id`
- `project_assignment.role_id -> tech_role.tech_role_id`

### 14.2 Seguimiento

- `project_update.project_id -> project.project_id`
- `project_update.executive_status_id -> executive_status.executive_status_id`
- `project_update.traffic_light_id -> traffic_light.traffic_light_id`
- `project_update.stopper_impact_id -> stopper_impact.stopper_impact_id`
- `project_update.responsible_area_id -> responsible_area.responsible_area_id`

### 14.3 Kanban

- `kanban_card.work_area_id -> work_area.work_area_id`
- `kanban_card.priority_level_id -> priority_level.priority_level_id`
- `kanban_card.kanban_status_id -> kanban_status.kanban_status_id`
- `kanban_card.project_id -> project.project_id`

### 14.4 OKR

- `okr_activity.okr_id -> okr.okr_id`
- `okr_activity.status_id -> okr_activity_status.okr_activity_status_id`
- `okr_activity_milestone.okr_activity_id -> okr_activity.okr_activity_id`

### 14.5 Seguridad

- `user_role.user_id -> app_user.user_id`
- `user_role.role_id -> role.role_id`
- `role_permission.role_id -> role.role_id`
- `role_permission.permission_id -> permission.permission_id`

## 15. Sequences requeridas

Una sequence por tabla con PK numerica:

- `seq_app_user`
- `seq_role`
- `seq_permission`
- `seq_user_role`
- `seq_role_permission`
- `seq_auth_refresh_token`
- `seq_pipeline_status`
- `seq_executive_status`
- `seq_traffic_light`
- `seq_work_area`
- `seq_kanban_status`
- `seq_priority_level`
- `seq_stopper_impact`
- `seq_responsible_area`
- `seq_tech_role`
- `seq_okr_activity_status`
- `seq_project`
- `seq_team_member`
- `seq_project_assignment`
- `seq_project_update`
- `seq_kanban_card`
- `seq_notification_reminder`
- `seq_activity_log`
- `seq_okr`
- `seq_okr_activity`
- `seq_okr_activity_milestone`
- `seq_migration_batch`
- `seq_legacy_id_map`
- `seq_migration_error`
- `seq_audit_event`

Configuracion recomendada:

- `START WITH 1`
- `INCREMENT BY 1`
- `NOCACHE` para ambientes regulados o `CACHE 50` para rendimiento.

Decision recomendada:

- `CACHE 50` en produccion salvo restriccion de auditoria que exija evitar saltos.

## 16. Indices funcionales recomendados

### 16.1 Estado actual de proyectos

- `ix_project_update__project_date(project_id, updated_at_original DESC)`

### 16.2 Dashboard y comite

- `ix_project_update__traffic_light`
- `ix_project_update__coordination`
- `ix_project_update__stopper`
- `ix_project_update__milestone_date`
- `ix_project__pipeline_status`

### 16.3 Kanban

- `ix_kanban_card__status`
- `ix_kanban_card__priority`
- `ix_kanban_card__due_date`
- `ix_kanban_card__reminder`

### 16.4 Equipos

- `ix_project_assignment__project`
- `ix_project_assignment__member`
- `ix_project_assignment__lead`

### 16.5 Migracion

- `ix_legacy_id_map__entity_legacy`
- `ix_migration_error__batch`

## 17. Reglas de integridad especificas

### 17.1 No relaciones implicitas

Toda asociacion funcional debe resolverse con FK:

- Updates a proyecto.
- Asignaciones a proyecto/persona.
- Kanban a proyecto si existe.
- OKR activities a OKR.
- Metas a activity.
- Roles/permisos a usuarios.

### 17.2 Campos legacy vacios

El JSON usa `""` para ausencia de valor.

Regla de migracion:

- Para columnas relacionales opcionales, `""` debe convertirse a `NULL`.
- Para textos funcionales donde el vacio sea parte del dato, preservar si existe justificacion.
- `legacy_id` no debe convertirse a number.

### 17.3 Catalogos no encontrados

Si un valor legacy no existe en catalogo:

1. Registrar error de migracion.
2. Crear valor controlado si fue aprobado.
3. No insertar dato funcional apuntando a FK inexistente.

### 17.4 Project update append-only

Reglas:

- Insert permitido.
- Update funcional prohibido.
- Delete fisico prohibido.
- Soft delete administrativo excepcional permitido.

## 18. Orden fisico de creacion

1. Tablas base de seguridad sin FKs circulares.
2. Catalogos.
3. Tablas RBAC intermedias.
4. Tablas de portafolio.
5. Tablas de equipo/asignaciones.
6. Tablas de tracking.
7. Tablas de Kanban.
8. Tablas de bitacora.
9. Tablas de OKR.
10. Tablas de migracion.
11. Tabla de auditoria.
12. FKs de auditoria hacia `app_user`, si se decide aplicarlas fisicamente.
13. Indices.
14. Vistas.
15. Triggers append-only.

## 19. Estrategia de migracion JSON a tablas

### 19.1 Mapeo principal

- `projects[] -> project`
- `teamMembers[] -> team_member`
- `projectAssignments[] -> project_assignment`
- `projectUpdates[] -> project_update`
- `kanban[] -> kanban_card`
- `logs[] -> activity_log`
- `okrs[] -> okr`
- `okrs[].activities[] -> okr_activity`
- `okrs[].activities[].metas[] -> okr_activity_milestone`

### 19.2 Resolucion de FKs

Project assignments:

- `projectAssignments.projectId` se busca en `legacy_id_map` entity `project`.
- `projectAssignments.memberId` se busca en `legacy_id_map` entity `team_member`.

Project updates:

- `projectUpdates.projectId` se busca en `legacy_id_map` entity `project`.

Kanban:

- si `projectId = ""`, `project_id = NULL`.
- si tiene valor, resolver por `legacy_id_map`.

OKR:

- `okr.id` se conserva como `legacy_id`.
- `activity.id` se conserva como `legacy_id` dentro del OKR.

### 19.3 Timestamps

- `projects.updatedAt -> project.legacy_updated_at`
- `projectUpdates.updatedAt -> project_update.updated_at_original`
- `kanban.createdAt -> kanban_card.created_at_original`
- `logs.ts -> activity_log.logged_at_original`
- `exportedAt -> migration_batch.exported_at`

### 19.4 Conteos esperados del JSON actual

- `project`: 18
- `team_member`: 12
- `project_assignment`: 46
- `project_update`: 57
- `kanban_card`: 4
- `activity_log`: 16
- `okr`: 3
- `okr_activity`: 9
- `okr_activity_milestone`: 17

## 20. Validaciones antes de FASE 4

Antes de generar scripts SQL se debe validar:

1. Nombres de tablas y columnas.
2. Si auditoria fisica tendra FKs directas a `app_user`.
3. Si soft delete aplica a todos los catalogos o solo tablas funcionales.
4. Si `project_update` permitira soft delete administrativo.
5. Si `legacy_id` sera unique global por tabla o solo por batch en `legacy_id_map`.
6. Si se usara trigger para append-only.
7. Si se creara vista `vw_project_current_status`.
8. Si Flyway sera la herramienta definitiva.

## 21. Decision recomendada

Modelo recomendado:

- PKs nuevas con sequences.
- `legacy_id` en cada tabla migrable.
- `legacy_id_map` como soporte de migracion y auditoria.
- Catalogos normalizados con FKs.
- Textos libres en CLOB solo cuando sean textos, no estructuras.
- `project_update` append-only protegido por backend y trigger.
- Auditoria transversal en tablas funcionales.
- Soft delete para entidades operativas, no delete fisico.
- Oracle 19c con constraints e indices explicitos.
