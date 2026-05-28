# FASE 5 - Backend Enterprise Spring Boot

## Resultado

Se genero el backend enterprise en:

```text
backend/
```

El backend esta preparado para conectarse al schema Oracle `APP_CURSOR` ya creado, sin regenerar tablas por JPA.

## Stack configurado

- Java 21
- Spring Boot 3.3.x
- Maven
- Spring Web
- Spring Data JPA
- Hibernate
- Oracle JDBC
- Flyway
- Spring Security
- JWT
- Bean Validation
- Lombok
- MapStruct
- OpenAPI / Swagger
- Docker
- Profiles `local` y `prod`

## Estructura principal

```text
backend/src/main/java/com/coltefinanciera/itdashboard
  config
  security
  shared
    audit
    exception
    pagination
  identity
    controller
    dto
    entity
    repository
    service
  catalog
    entity
    repository
  portfolio
    controller
    dto
    entity
    mapper
    repository
    service
  tracking
    controller
    dto
    entity
    mapper
    repository
    service
  work
    controller
    dto
    entity
    repository
    service
  team
    controller
    dto
    entity
    repository
    service
  okr
    controller
    dto
    entity
    repository
    service
  logbook
    controller
    dto
    entity
    repository
    service
  dashboard
    controller
    dto
    service
```

## Configuracion

Archivos:

- `backend/pom.xml`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-local.yml`
- `backend/src/main/resources/application-prod.yml`
- `backend/Dockerfile`
- `backend/README.md`

Datasource local:

```yaml
DB_URL=jdbc:oracle:thin:@localhost:1521/FREEPDB1
DB_USERNAME=APP_CURSOR
DB_PASSWORD=APP_CURSOR
```

JPA:

```yaml
spring.jpa.hibernate.ddl-auto=validate
```

Esto asegura que el backend valida el modelo existente y no crea/modifica tablas.

## APIs iniciales

Auth:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`

Dashboard:

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/committee/summary`

Projects:

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/{projectId}`
- `PUT /api/v1/projects/{projectId}`
- `DELETE /api/v1/projects/{projectId}`

Project updates:

- `GET /api/v1/projects/{projectId}/updates`
- `POST /api/v1/projects/{projectId}/updates`
- `GET /api/v1/projects/{projectId}/current-status`
- `GET /api/v1/projects/{projectId}/status-at`

Kanban:

- `GET /api/v1/kanban/cards`
- `POST /api/v1/kanban/cards`
- `PATCH /api/v1/kanban/cards/{cardId}/status`

Teams:

- `GET /api/v1/team-members`

OKRs:

- `GET /api/v1/okrs`

Activity logs:

- `GET /api/v1/activity-logs`
- `POST /api/v1/activity-logs`

## Seguridad

Se implemento:

- JWT stateless.
- Spring Security.
- RBAC por permisos.
- Authorities con prefijo `PERM_`.
- `@PreAuthorize` en servicios.

Ejemplos:

- `PERM_projects:read`
- `PERM_project-updates:create`
- `PERM_kanban:update`

## Auditoria

Se implemento clase base:

- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- `is_deleted`
- `deleted_at`
- `deleted_by`

La auditoria usa `AuditorAware` con el usuario autenticado por JWT.

## Append-only

`project_update` se respeta como append-only:

- El backend solo expone creacion y consulta.
- No existe endpoint funcional de update para `project_update`.
- Oracle mantiene triggers append-only como segunda linea de defensa.

## Validacion local

Se intento ejecutar:

```bash
mvn -q -DskipTests compile
```

pero la maquina no tiene `mvn` instalado en PATH.

Resultado:

```text
mvn no se reconoce como cmdlet o programa ejecutable
```

La revision de lints del IDE no reporto errores.

## Como compilar

Con Maven instalado:

```bash
cd backend
mvn clean compile
mvn test
mvn clean package
```

Con Docker:

```bash
cd backend
docker build -t it-dashboard-backend .
```

## Precondiciones para ejecutar

1. Oracle 19c local disponible.
2. Schema `APP_CURSOR` creado.
3. Scripts de FASE 4 ejecutados.
4. Usuario inicial con password BCrypt creado en `app_user`.
5. Roles/permisos asignados mediante `user_role`.
6. Variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `APP_JWT_SECRET` configuradas.

## Pendientes recomendados antes de frontend

1. Instalar Maven o compilar via Docker.
2. Crear usuario admin inicial si no existe.
3. Ejecutar smoke test de login.
4. Probar endpoints protegidos con JWT.
5. Validar `ddl-auto=validate` contra Oracle real.
6. Ampliar CRUD completo para asignaciones, OKR progress y deletes administrativos si se requiere.
