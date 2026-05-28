# IT Dashboard Backend

Backend enterprise Spring Boot para la plataforma Coordinadora IT.

## Stack

- Java 21
- Spring Boot 3
- Maven
- Spring Data JPA / Hibernate
- Oracle JDBC
- Flyway
- Spring Security + JWT
- Bean Validation
- Lombok
- MapStruct
- OpenAPI / Swagger

## Base de Datos

El backend usa el schema Oracle existente `APP_CURSOR`. No crea ni regenera tablas por JPA.

Requisitos:

1. Ejecutar previamente los scripts Oracle en `../sql/oracle`.
2. Verificar que el schema tenga tablas, sequences, constraints, vistas y triggers.
3. Configurar credenciales por variables de entorno o `application-local.yml`.

Variables locales:

```bash
DB_URL=jdbc:oracle:thin:@localhost:1521/FREEPDB1
DB_USERNAME=APP_CURSOR
DB_PASSWORD=APP_CURSOR
APP_JWT_SECRET=change-this-local-development-secret-32b
```

## Ejecutar Localmente

```bash
cd backend
mvn clean spring-boot:run
```

Swagger:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI:

```text
http://localhost:8080/api-docs
```

## Comandos Maven

```bash
mvn clean compile
mvn test
mvn clean package
```

## Endpoints Iniciales

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/committee/summary`
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/{projectId}`
- `PUT /api/v1/projects/{projectId}`
- `DELETE /api/v1/projects/{projectId}`
- `GET /api/v1/projects/{projectId}/updates`
- `POST /api/v1/projects/{projectId}/updates`
- `GET /api/v1/projects/{projectId}/current-status`
- `GET /api/v1/projects/{projectId}/status-at`
- `GET /api/v1/kanban/cards`
- `POST /api/v1/kanban/cards`
- `PATCH /api/v1/kanban/cards/{cardId}/status`
- `GET /api/v1/team-members`
- `GET /api/v1/okrs`
- `GET /api/v1/activity-logs`
- `POST /api/v1/activity-logs`

## Seguridad

El backend usa JWT stateless. Los permisos se exponen como authorities con prefijo `PERM_`.

Ejemplo:

```text
PERM_projects:read
PERM_project-updates:create
PERM_kanban:update
```

## Reglas Importantes

- `project_update` se trata como append-only desde servicio y base de datos.
- Se usa soft delete en entidades funcionales.
- Se conserva `legacy_id`.
- JPA usa `ddl-auto=validate`, nunca `create` ni `update`.
- Flyway queda habilitado con `baseline-on-migrate=true` para convivir con el schema ya creado.

## Docker

```bash
docker build -t it-dashboard-backend .
docker run --rm -p 8080:8080 \
  -e DB_URL=jdbc:oracle:thin:@host.docker.internal:1521/FREEPDB1 \
  -e DB_USERNAME=APP_CURSOR \
  -e DB_PASSWORD=APP_CURSOR \
  -e APP_JWT_SECRET=change-this-local-development-secret-32b \
  it-dashboard-backend
```
