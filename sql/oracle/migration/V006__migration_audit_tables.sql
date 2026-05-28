-- ============================================================================
-- V006__migration_audit_tables.sql
-- Oracle 19c - Migration staging, legacy mapping and audit event tables
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

CREATE TABLE migration_batch (
  migration_batch_id  NUMBER(19,0) NOT NULL,
  source_file_name    VARCHAR2(300 CHAR) NOT NULL,
  source_version      VARCHAR2(30 CHAR) NULL,
  exported_at         TIMESTAMP(6) WITH TIME ZONE NULL,
  exported_date_label VARCHAR2(200 CHAR) NULL,
  status              VARCHAR2(30 CHAR) NOT NULL,
  total_records       NUMBER(10,0) DEFAULT 0 NOT NULL,
  success_records     NUMBER(10,0) DEFAULT 0 NOT NULL,
  error_records       NUMBER(10,0) DEFAULT 0 NOT NULL,
  started_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  finished_at         TIMESTAMP(6) WITH TIME ZONE NULL,
  created_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by          NUMBER(19,0) NULL,
  updated_by          NUMBER(19,0) NULL,
  is_deleted          CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at          TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by          NUMBER(19,0) NULL,
  CONSTRAINT pk_migration_batch PRIMARY KEY (migration_batch_id),
  CONSTRAINT ck_migration_batch__status CHECK (
    status IN ('PENDING','RUNNING','COMPLETED','FAILED','COMPLETED_WITH_ERRORS')
  ),
  CONSTRAINT ck_migration_batch__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE legacy_id_map (
  legacy_id_map_id   NUMBER(19,0) NOT NULL,
  migration_batch_id NUMBER(19,0) NOT NULL,
  entity_type        VARCHAR2(80 CHAR) NOT NULL,
  legacy_id          VARCHAR2(100 CHAR) NOT NULL,
  new_entity_table   VARCHAR2(80 CHAR) NOT NULL,
  new_entity_id      NUMBER(19,0) NOT NULL,
  notes              VARCHAR2(500 CHAR) NULL,
  created_at         TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at         TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by         NUMBER(19,0) NULL,
  updated_by         NUMBER(19,0) NULL,
  is_deleted         CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at         TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by         NUMBER(19,0) NULL,
  CONSTRAINT pk_legacy_id_map PRIMARY KEY (legacy_id_map_id),
  CONSTRAINT uk_legacy_id_map__batch_entity UNIQUE (migration_batch_id, entity_type, legacy_id),
  CONSTRAINT ck_legacy_id_map__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE migration_error (
  migration_error_id NUMBER(19,0) NOT NULL,
  migration_batch_id NUMBER(19,0) NOT NULL,
  entity_type        VARCHAR2(80 CHAR) NULL,
  legacy_id          VARCHAR2(100 CHAR) NULL,
  error_code         VARCHAR2(80 CHAR) NOT NULL,
  error_message      VARCHAR2(1000 CHAR) NOT NULL,
  raw_path           VARCHAR2(500 CHAR) NULL,
  created_at         TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT pk_migration_error PRIMARY KEY (migration_error_id)
);

CREATE TABLE audit_event (
  audit_event_id NUMBER(19,0) NOT NULL,
  event_type     VARCHAR2(80 CHAR) NOT NULL,
  entity_name    VARCHAR2(80 CHAR) NULL,
  entity_id      NUMBER(19,0) NULL,
  legacy_id      VARCHAR2(100 CHAR) NULL,
  action         VARCHAR2(80 CHAR) NOT NULL,
  summary        VARCHAR2(1000 CHAR) NULL,
  before_hash    VARCHAR2(128 CHAR) NULL,
  after_hash     VARCHAR2(128 CHAR) NULL,
  performed_by   NUMBER(19,0) NULL,
  performed_at   TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  ip_address     VARCHAR2(64 CHAR) NULL,
  user_agent     VARCHAR2(500 CHAR) NULL,
  CONSTRAINT pk_audit_event PRIMARY KEY (audit_event_id)
);

CREATE TABLE stg_legacy_backup (
  stg_legacy_backup_id NUMBER(19,0) NOT NULL,
  migration_batch_id   NUMBER(19,0) NOT NULL,
  source_file_name     VARCHAR2(300 CHAR) NOT NULL,
  raw_json             CLOB NOT NULL,
  loaded_at            TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  loaded_by            NUMBER(19,0) NULL,
  CONSTRAINT pk_stg_legacy_backup PRIMARY KEY (stg_legacy_backup_id),
  CONSTRAINT ck_stg_legacy_backup__json CHECK (raw_json IS JSON)
);

COMMIT;
