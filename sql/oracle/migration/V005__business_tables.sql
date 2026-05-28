-- ============================================================================
-- V005__business_tables.sql
-- Oracle 19c - Portfolio, tracking, work, logbook and OKR business tables
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

CREATE TABLE project (
  project_id          NUMBER(19,0) NOT NULL,
  legacy_id           VARCHAR2(100 CHAR) NULL,
  name                VARCHAR2(250 CHAR) NOT NULL,
  pipeline_status_id  NUMBER(19,0) NOT NULL,
  start_date          DATE NULL,
  legacy_updated_at   TIMESTAMP(6) WITH TIME ZONE NULL,
  is_ghost            CHAR(1) DEFAULT 'N' NOT NULL,
  created_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by          NUMBER(19,0) NULL,
  updated_by          NUMBER(19,0) NULL,
  is_deleted          CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at          TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by          NUMBER(19,0) NULL,
  CONSTRAINT pk_project PRIMARY KEY (project_id),
  CONSTRAINT uk_project__legacy_id UNIQUE (legacy_id),
  CONSTRAINT ck_project__ghost CHECK (is_ghost IN ('Y','N')),
  CONSTRAINT ck_project__deleted CHECK (is_deleted IN ('Y','N')),
  CONSTRAINT ck_project__deleted_at CHECK (
    (is_deleted = 'N' AND deleted_at IS NULL) OR is_deleted = 'Y'
  )
);

CREATE TABLE team_member (
  team_member_id  NUMBER(19,0) NOT NULL,
  legacy_id       VARCHAR2(100 CHAR) NULL,
  name            VARCHAR2(200 CHAR) NOT NULL,
  default_role_id NUMBER(19,0) NULL,
  email           VARCHAR2(150 CHAR) NULL,
  active          CHAR(1) DEFAULT 'Y' NOT NULL,
  notes           CLOB NULL,
  created_at      TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at      TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by      NUMBER(19,0) NULL,
  updated_by      NUMBER(19,0) NULL,
  is_deleted      CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at      TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by      NUMBER(19,0) NULL,
  CONSTRAINT pk_team_member PRIMARY KEY (team_member_id),
  CONSTRAINT uk_team_member__legacy_id UNIQUE (legacy_id),
  CONSTRAINT ck_team_member__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_team_member__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE project_assignment (
  project_assignment_id NUMBER(19,0) NOT NULL,
  legacy_id             VARCHAR2(100 CHAR) NULL,
  project_id            NUMBER(19,0) NOT NULL,
  team_member_id        NUMBER(19,0) NOT NULL,
  role_id               NUMBER(19,0) NOT NULL,
  is_lead               CHAR(1) DEFAULT 'N' NOT NULL,
  valid_from            TIMESTAMP(6) WITH TIME ZONE NULL,
  valid_to              TIMESTAMP(6) WITH TIME ZONE NULL,
  created_at            TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at            TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by            NUMBER(19,0) NULL,
  updated_by            NUMBER(19,0) NULL,
  is_deleted            CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at            TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by            NUMBER(19,0) NULL,
  CONSTRAINT pk_project_assignment PRIMARY KEY (project_assignment_id),
  CONSTRAINT uk_project_assignment__legacy_id UNIQUE (legacy_id),
  CONSTRAINT ck_project_assignment__lead CHECK (is_lead IN ('Y','N')),
  CONSTRAINT ck_project_assignment__deleted CHECK (is_deleted IN ('Y','N')),
  CONSTRAINT ck_project_assignment__dates CHECK (
    valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from
  )
);

CREATE TABLE project_update (
  project_update_id      NUMBER(19,0) NOT NULL,
  legacy_id              VARCHAR2(100 CHAR) NULL,
  project_id             NUMBER(19,0) NOT NULL,
  updated_at_original    TIMESTAMP(6) WITH TIME ZONE NOT NULL,
  executive_status_id    NUMBER(19,0) NOT NULL,
  traffic_light_id       NUMBER(19,0) NOT NULL,
  summary                CLOB NOT NULL,
  pending_items          CLOB NULL,
  has_stopper            CHAR(1) DEFAULT 'N' NOT NULL,
  stopper_desc           CLOB NULL,
  stopper_owner          VARCHAR2(250 CHAR) NULL,
  stopper_impact_id      NUMBER(19,0) NULL,
  relevant_risks         CLOB NULL,
  next_milestone         VARCHAR2(500 CHAR) NULL,
  next_milestone_date    DATE NULL,
  pending_decisions      CLOB NULL,
  requires_coordination  CHAR(1) DEFAULT 'N' NOT NULL,
  coordination_desc      CLOB NULL,
  responsible_area_id    NUMBER(19,0) NULL,
  responsible_action     CLOB NULL,
  additional_notes       CLOB NULL,
  created_at             TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at             TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by             NUMBER(19,0) NULL,
  updated_by             NUMBER(19,0) NULL,
  is_deleted             CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at             TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by             NUMBER(19,0) NULL,
  CONSTRAINT pk_project_update PRIMARY KEY (project_update_id),
  CONSTRAINT uk_project_update__legacy_id UNIQUE (legacy_id),
  CONSTRAINT ck_project_update__stopper CHECK (has_stopper IN ('Y','N')),
  CONSTRAINT ck_project_update__coord CHECK (requires_coordination IN ('Y','N')),
  CONSTRAINT ck_project_update__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE kanban_card (
  kanban_card_id    NUMBER(19,0) NOT NULL,
  legacy_id         VARCHAR2(100 CHAR) NULL,
  text              CLOB NOT NULL,
  work_area_id      NUMBER(19,0) NOT NULL,
  priority_level_id NUMBER(19,0) NOT NULL,
  kanban_status_id  NUMBER(19,0) NOT NULL,
  due_date          DATE NULL,
  reminder_at       TIMESTAMP(6) WITH TIME ZONE NULL,
  project_id        NUMBER(19,0) NULL,
  created_at_original TIMESTAMP(6) WITH TIME ZONE NULL,
  created_at        TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at        TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by        NUMBER(19,0) NULL,
  updated_by        NUMBER(19,0) NULL,
  is_deleted        CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at        TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by        NUMBER(19,0) NULL,
  CONSTRAINT pk_kanban_card PRIMARY KEY (kanban_card_id),
  CONSTRAINT uk_kanban_card__legacy_id UNIQUE (legacy_id),
  CONSTRAINT ck_kanban_card__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE notification_reminder (
  notification_reminder_id NUMBER(19,0) NOT NULL,
  kanban_card_id           NUMBER(19,0) NULL,
  project_update_id        NUMBER(19,0) NULL,
  reminder_at              TIMESTAMP(6) WITH TIME ZONE NOT NULL,
  status                   VARCHAR2(30 CHAR) DEFAULT 'PENDING' NOT NULL,
  sent_at                  TIMESTAMP(6) WITH TIME ZONE NULL,
  channel                  VARCHAR2(30 CHAR) DEFAULT 'IN_APP' NOT NULL,
  created_at               TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at               TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by               NUMBER(19,0) NULL,
  updated_by               NUMBER(19,0) NULL,
  is_deleted               CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at               TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by               NUMBER(19,0) NULL,
  CONSTRAINT pk_notification_reminder PRIMARY KEY (notification_reminder_id),
  CONSTRAINT ck_notification_reminder__status CHECK (status IN ('PENDING','SENT','CANCELLED','FAILED')),
  CONSTRAINT ck_notification_reminder__channel CHECK (channel IN ('IN_APP','EMAIL')),
  CONSTRAINT ck_notification_reminder__target CHECK (
    kanban_card_id IS NOT NULL OR project_update_id IS NOT NULL
  ),
  CONSTRAINT ck_notification_reminder__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE activity_log (
  activity_log_id    NUMBER(19,0) NOT NULL,
  legacy_id          VARCHAR2(100 CHAR) NULL,
  text               CLOB NOT NULL,
  work_area_id       NUMBER(19,0) NOT NULL,
  logged_at_original TIMESTAMP(6) WITH TIME ZONE NOT NULL,
  created_at         TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at         TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by         NUMBER(19,0) NULL,
  updated_by         NUMBER(19,0) NULL,
  is_deleted         CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at         TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by         NUMBER(19,0) NULL,
  CONSTRAINT pk_activity_log PRIMARY KEY (activity_log_id),
  CONSTRAINT uk_activity_log__legacy_id UNIQUE (legacy_id),
  CONSTRAINT ck_activity_log__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE okr (
  okr_id       NUMBER(19,0) NOT NULL,
  legacy_id    VARCHAR2(100 CHAR) NULL,
  name         VARCHAR2(1000 CHAR) NOT NULL,
  sort_order   NUMBER(5,0) DEFAULT 0 NOT NULL,
  created_at   TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at   TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by   NUMBER(19,0) NULL,
  updated_by   NUMBER(19,0) NULL,
  is_deleted   CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at   TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by   NUMBER(19,0) NULL,
  CONSTRAINT pk_okr PRIMARY KEY (okr_id),
  CONSTRAINT uk_okr__legacy_id UNIQUE (legacy_id),
  CONSTRAINT ck_okr__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE okr_activity (
  okr_activity_id NUMBER(19,0) NOT NULL,
  okr_id          NUMBER(19,0) NOT NULL,
  legacy_id       VARCHAR2(100 CHAR) NULL,
  pct             NUMBER(5,2) DEFAULT 0 NOT NULL,
  status_id       NUMBER(19,0) NOT NULL,
  text            CLOB NOT NULL,
  responsible     VARCHAR2(250 CHAR) NULL,
  dependency      VARCHAR2(500 CHAR) NULL,
  deliverable     CLOB NULL,
  sort_order      NUMBER(5,0) DEFAULT 0 NOT NULL,
  created_at      TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at      TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by      NUMBER(19,0) NULL,
  updated_by      NUMBER(19,0) NULL,
  is_deleted      CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at      TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by      NUMBER(19,0) NULL,
  CONSTRAINT pk_okr_activity PRIMARY KEY (okr_activity_id),
  CONSTRAINT uk_okr_activity__okr_legacy UNIQUE (okr_id, legacy_id),
  CONSTRAINT ck_okr_activity__pct CHECK (pct >= 0 AND pct <= 100),
  CONSTRAINT ck_okr_activity__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE okr_activity_milestone (
  okr_activity_milestone_id NUMBER(19,0) NOT NULL,
  okr_activity_id           NUMBER(19,0) NOT NULL,
  quarter_code              VARCHAR2(20 CHAR) NOT NULL,
  quarter_label             VARCHAR2(30 CHAR) NOT NULL,
  month_abbr                VARCHAR2(20 CHAR) NOT NULL,
  pct                       NUMBER(5,2) NOT NULL,
  sort_order                NUMBER(5,0) DEFAULT 0 NOT NULL,
  created_at                TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at                TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by                NUMBER(19,0) NULL,
  updated_by                NUMBER(19,0) NULL,
  is_deleted                CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at                TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by                NUMBER(19,0) NULL,
  CONSTRAINT pk_okr_activity_milestone PRIMARY KEY (okr_activity_milestone_id),
  CONSTRAINT ck_okr_activity_milestone__pct CHECK (pct >= 0 AND pct <= 100),
  CONSTRAINT ck_okr_activity_milestone__deleted CHECK (is_deleted IN ('Y','N'))
);

COMMIT;
