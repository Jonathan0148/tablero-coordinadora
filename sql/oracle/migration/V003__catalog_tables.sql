-- ============================================================================
-- V003__catalog_tables.sql
-- Oracle 19c - Normalized catalog tables
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

CREATE TABLE pipeline_status (
  pipeline_status_id NUMBER(19,0) NOT NULL,
  code               VARCHAR2(60 CHAR) NOT NULL,
  name               VARCHAR2(150 CHAR) NOT NULL,
  description        VARCHAR2(500 CHAR) NULL,
  sort_order         NUMBER(5,0) DEFAULT 0 NOT NULL,
  active             CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at         TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at         TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by         NUMBER(19,0) NULL,
  updated_by         NUMBER(19,0) NULL,
  is_deleted         CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at         TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by         NUMBER(19,0) NULL,
  CONSTRAINT pk_pipeline_status PRIMARY KEY (pipeline_status_id),
  CONSTRAINT uk_pipeline_status__code UNIQUE (code),
  CONSTRAINT ck_pipeline_status__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_pipeline_status__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE executive_status (
  executive_status_id NUMBER(19,0) NOT NULL,
  code                VARCHAR2(60 CHAR) NOT NULL,
  name                VARCHAR2(150 CHAR) NOT NULL,
  description         VARCHAR2(500 CHAR) NULL,
  sort_order          NUMBER(5,0) DEFAULT 0 NOT NULL,
  active              CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by          NUMBER(19,0) NULL,
  updated_by          NUMBER(19,0) NULL,
  is_deleted          CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at          TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by          NUMBER(19,0) NULL,
  CONSTRAINT pk_executive_status PRIMARY KEY (executive_status_id),
  CONSTRAINT uk_executive_status__code UNIQUE (code),
  CONSTRAINT ck_executive_status__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_executive_status__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE traffic_light (
  traffic_light_id NUMBER(19,0) NOT NULL,
  code             VARCHAR2(60 CHAR) NOT NULL,
  name             VARCHAR2(150 CHAR) NOT NULL,
  description      VARCHAR2(500 CHAR) NULL,
  sort_order       NUMBER(5,0) DEFAULT 0 NOT NULL,
  active           CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at       TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at       TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by       NUMBER(19,0) NULL,
  updated_by       NUMBER(19,0) NULL,
  is_deleted       CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at       TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by       NUMBER(19,0) NULL,
  CONSTRAINT pk_traffic_light PRIMARY KEY (traffic_light_id),
  CONSTRAINT uk_traffic_light__code UNIQUE (code),
  CONSTRAINT ck_traffic_light__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_traffic_light__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE work_area (
  work_area_id NUMBER(19,0) NOT NULL,
  code         VARCHAR2(60 CHAR) NOT NULL,
  legacy_code  VARCHAR2(30 CHAR) NOT NULL,
  name         VARCHAR2(150 CHAR) NOT NULL,
  description  VARCHAR2(500 CHAR) NULL,
  sort_order   NUMBER(5,0) DEFAULT 0 NOT NULL,
  active       CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at   TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at   TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by   NUMBER(19,0) NULL,
  updated_by   NUMBER(19,0) NULL,
  is_deleted   CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at   TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by   NUMBER(19,0) NULL,
  CONSTRAINT pk_work_area PRIMARY KEY (work_area_id),
  CONSTRAINT uk_work_area__code UNIQUE (code),
  CONSTRAINT uk_work_area__legacy_code UNIQUE (legacy_code),
  CONSTRAINT ck_work_area__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_work_area__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE kanban_status (
  kanban_status_id NUMBER(19,0) NOT NULL,
  code             VARCHAR2(60 CHAR) NOT NULL,
  legacy_code      VARCHAR2(30 CHAR) NOT NULL,
  name             VARCHAR2(150 CHAR) NOT NULL,
  description      VARCHAR2(500 CHAR) NULL,
  sort_order       NUMBER(5,0) DEFAULT 0 NOT NULL,
  active           CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at       TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at       TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by       NUMBER(19,0) NULL,
  updated_by       NUMBER(19,0) NULL,
  is_deleted       CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at       TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by       NUMBER(19,0) NULL,
  CONSTRAINT pk_kanban_status PRIMARY KEY (kanban_status_id),
  CONSTRAINT uk_kanban_status__code UNIQUE (code),
  CONSTRAINT uk_kanban_status__legacy_code UNIQUE (legacy_code),
  CONSTRAINT ck_kanban_status__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_kanban_status__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE priority_level (
  priority_level_id NUMBER(19,0) NOT NULL,
  code              VARCHAR2(60 CHAR) NOT NULL,
  legacy_code       VARCHAR2(30 CHAR) NOT NULL,
  name              VARCHAR2(150 CHAR) NOT NULL,
  description       VARCHAR2(500 CHAR) NULL,
  sort_order        NUMBER(5,0) DEFAULT 0 NOT NULL,
  active            CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at        TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at        TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by        NUMBER(19,0) NULL,
  updated_by        NUMBER(19,0) NULL,
  is_deleted        CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at        TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by        NUMBER(19,0) NULL,
  CONSTRAINT pk_priority_level PRIMARY KEY (priority_level_id),
  CONSTRAINT uk_priority_level__code UNIQUE (code),
  CONSTRAINT uk_priority_level__legacy_code UNIQUE (legacy_code),
  CONSTRAINT ck_priority_level__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_priority_level__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE stopper_impact (
  stopper_impact_id NUMBER(19,0) NOT NULL,
  code              VARCHAR2(60 CHAR) NOT NULL,
  name              VARCHAR2(150 CHAR) NOT NULL,
  description       VARCHAR2(500 CHAR) NULL,
  sort_order        NUMBER(5,0) DEFAULT 0 NOT NULL,
  active            CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at        TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at        TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by        NUMBER(19,0) NULL,
  updated_by        NUMBER(19,0) NULL,
  is_deleted        CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at        TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by        NUMBER(19,0) NULL,
  CONSTRAINT pk_stopper_impact PRIMARY KEY (stopper_impact_id),
  CONSTRAINT uk_stopper_impact__code UNIQUE (code),
  CONSTRAINT ck_stopper_impact__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_stopper_impact__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE responsible_area (
  responsible_area_id NUMBER(19,0) NOT NULL,
  code                VARCHAR2(60 CHAR) NOT NULL,
  name                VARCHAR2(150 CHAR) NOT NULL,
  description         VARCHAR2(500 CHAR) NULL,
  sort_order          NUMBER(5,0) DEFAULT 0 NOT NULL,
  active              CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by          NUMBER(19,0) NULL,
  updated_by          NUMBER(19,0) NULL,
  is_deleted          CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at          TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by          NUMBER(19,0) NULL,
  CONSTRAINT pk_responsible_area PRIMARY KEY (responsible_area_id),
  CONSTRAINT uk_responsible_area__code UNIQUE (code),
  CONSTRAINT ck_responsible_area__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_responsible_area__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE tech_role (
  tech_role_id NUMBER(19,0) NOT NULL,
  code         VARCHAR2(60 CHAR) NOT NULL,
  name         VARCHAR2(150 CHAR) NOT NULL,
  description  VARCHAR2(500 CHAR) NULL,
  sort_order   NUMBER(5,0) DEFAULT 0 NOT NULL,
  active       CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at   TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at   TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by   NUMBER(19,0) NULL,
  updated_by   NUMBER(19,0) NULL,
  is_deleted   CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at   TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by   NUMBER(19,0) NULL,
  CONSTRAINT pk_tech_role PRIMARY KEY (tech_role_id),
  CONSTRAINT uk_tech_role__code UNIQUE (code),
  CONSTRAINT ck_tech_role__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_tech_role__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE okr_activity_status (
  okr_activity_status_id NUMBER(19,0) NOT NULL,
  code                   VARCHAR2(60 CHAR) NOT NULL,
  name                   VARCHAR2(150 CHAR) NOT NULL,
  description            VARCHAR2(500 CHAR) NULL,
  sort_order             NUMBER(5,0) DEFAULT 0 NOT NULL,
  active                 CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at             TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at             TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by             NUMBER(19,0) NULL,
  updated_by             NUMBER(19,0) NULL,
  is_deleted             CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at             TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by             NUMBER(19,0) NULL,
  CONSTRAINT pk_okr_activity_status PRIMARY KEY (okr_activity_status_id),
  CONSTRAINT uk_okr_activity_status__code UNIQUE (code),
  CONSTRAINT ck_okr_activity_status__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_okr_activity_status__deleted CHECK (is_deleted IN ('Y','N'))
);

COMMIT;
