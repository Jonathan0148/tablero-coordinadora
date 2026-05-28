-- ============================================================================
-- V002__security_rbac_tables.sql
-- Oracle 19c - Security, RBAC and JWT refresh token persistence
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

CREATE TABLE app_user (
  user_id        NUMBER(19,0) NOT NULL,
  username       VARCHAR2(80 CHAR) NOT NULL,
  email          VARCHAR2(150 CHAR) NOT NULL,
  password_hash  VARCHAR2(255 CHAR) NOT NULL,
  full_name      VARCHAR2(200 CHAR) NOT NULL,
  active         CHAR(1) DEFAULT 'Y' NOT NULL,
  last_login_at  TIMESTAMP(6) WITH TIME ZONE NULL,
  created_at     TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at     TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by     NUMBER(19,0) NULL,
  updated_by     NUMBER(19,0) NULL,
  is_deleted     CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at     TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by     NUMBER(19,0) NULL,
  CONSTRAINT pk_app_user PRIMARY KEY (user_id),
  CONSTRAINT uk_app_user__username UNIQUE (username),
  CONSTRAINT uk_app_user__email UNIQUE (email),
  CONSTRAINT ck_app_user__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_app_user__deleted CHECK (is_deleted IN ('Y','N')),
  CONSTRAINT ck_app_user__deleted_at CHECK (
    (is_deleted = 'N' AND deleted_at IS NULL) OR is_deleted = 'Y'
  )
);

CREATE TABLE role (
  role_id      NUMBER(19,0) NOT NULL,
  code         VARCHAR2(60 CHAR) NOT NULL,
  name         VARCHAR2(150 CHAR) NOT NULL,
  description  VARCHAR2(500 CHAR) NULL,
  active       CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at   TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at   TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by   NUMBER(19,0) NULL,
  updated_by   NUMBER(19,0) NULL,
  is_deleted   CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at   TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by   NUMBER(19,0) NULL,
  CONSTRAINT pk_role PRIMARY KEY (role_id),
  CONSTRAINT uk_role__code UNIQUE (code),
  CONSTRAINT ck_role__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_role__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE permission (
  permission_id  NUMBER(19,0) NOT NULL,
  code           VARCHAR2(100 CHAR) NOT NULL,
  module         VARCHAR2(60 CHAR) NOT NULL,
  action         VARCHAR2(60 CHAR) NOT NULL,
  description    VARCHAR2(500 CHAR) NULL,
  active         CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at     TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at     TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by     NUMBER(19,0) NULL,
  updated_by     NUMBER(19,0) NULL,
  is_deleted     CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at     TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by     NUMBER(19,0) NULL,
  CONSTRAINT pk_permission PRIMARY KEY (permission_id),
  CONSTRAINT uk_permission__code UNIQUE (code),
  CONSTRAINT uk_permission__module_action UNIQUE (module, action),
  CONSTRAINT ck_permission__active CHECK (active IN ('Y','N')),
  CONSTRAINT ck_permission__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE user_role (
  user_role_id  NUMBER(19,0) NOT NULL,
  user_id       NUMBER(19,0) NOT NULL,
  role_id       NUMBER(19,0) NOT NULL,
  created_at    TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at    TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by    NUMBER(19,0) NULL,
  updated_by    NUMBER(19,0) NULL,
  is_deleted    CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at    TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by    NUMBER(19,0) NULL,
  CONSTRAINT pk_user_role PRIMARY KEY (user_role_id),
  CONSTRAINT uk_user_role__user_role UNIQUE (user_id, role_id),
  CONSTRAINT ck_user_role__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE role_permission (
  role_permission_id  NUMBER(19,0) NOT NULL,
  role_id             NUMBER(19,0) NOT NULL,
  permission_id       NUMBER(19,0) NOT NULL,
  created_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by          NUMBER(19,0) NULL,
  updated_by          NUMBER(19,0) NULL,
  is_deleted          CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at          TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by          NUMBER(19,0) NULL,
  CONSTRAINT pk_role_permission PRIMARY KEY (role_permission_id),
  CONSTRAINT uk_role_permission__role_perm UNIQUE (role_id, permission_id),
  CONSTRAINT ck_role_permission__deleted CHECK (is_deleted IN ('Y','N'))
);

CREATE TABLE auth_refresh_token (
  refresh_token_id  NUMBER(19,0) NOT NULL,
  user_id           NUMBER(19,0) NOT NULL,
  token_hash        VARCHAR2(255 CHAR) NOT NULL,
  issued_at         TIMESTAMP(6) WITH TIME ZONE NOT NULL,
  expires_at        TIMESTAMP(6) WITH TIME ZONE NOT NULL,
  revoked_at        TIMESTAMP(6) WITH TIME ZONE NULL,
  ip_address        VARCHAR2(64 CHAR) NULL,
  user_agent        VARCHAR2(500 CHAR) NULL,
  created_at        TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at        TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  created_by        NUMBER(19,0) NULL,
  updated_by        NUMBER(19,0) NULL,
  is_deleted        CHAR(1) DEFAULT 'N' NOT NULL,
  deleted_at        TIMESTAMP(6) WITH TIME ZONE NULL,
  deleted_by        NUMBER(19,0) NULL,
  CONSTRAINT pk_auth_refresh_token PRIMARY KEY (refresh_token_id),
  CONSTRAINT uk_auth_refresh_token__hash UNIQUE (token_hash),
  CONSTRAINT ck_auth_refresh_token__deleted CHECK (is_deleted IN ('Y','N')),
  CONSTRAINT ck_auth_refresh_token__dates CHECK (expires_at > issued_at)
);

COMMIT;
