-- ============================================================================
-- V013__oracle_session_audit_triggers.sql
-- Deprecated placeholder.
--
-- The initial implementation resolved Oracle SESSION_USER to APP_USER.USER_ID,
-- which is not the required DB-session audit model. The corrected implementation
-- is V014__oracle_session_audit_varchar_refactor.sql.
-- ============================================================================

WHENEVER SQLERROR EXIT SQL.SQLCODE;

PROMPT V013 deprecated. Oracle session audit is implemented by V014.

COMMIT;
