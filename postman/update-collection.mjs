import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const collectionPath = path.join(__dirname, "IT_Dashboard_Enterprise.postman_collection.json");
const envPath = path.join(__dirname, "local.postman_environment.json");

const collection = JSON.parse(fs.readFileSync(collectionPath, "utf8").replace(/^\uFEFF/, ""));
const environment = JSON.parse(fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, ""));

const wrapperTest = [
  "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
  "const response = pm.response.json();",
  "pm.test('Enterprise response wrapper exists', function () { pm.expect(response).to.include.keys(['code', 'message', 'userMessage', 'data']); });",
  "const json = response.data;",
];

function makeRequest({ name, method, urlPath, body, description, tests = [], query = [] }) {
  const segments = urlPath.split("/").filter(Boolean);
  const item = {
    name,
    event: tests.length
      ? [{ listen: "test", script: { type: "text/javascript", exec: tests } }]
      : undefined,
    request: {
      method,
      header: body ? [{ key: "Content-Type", value: "application/json" }] : [],
      url: {
        raw: `{{baseUrl}}/${urlPath}${query.length ? "?" + query.map((q) => `${q.key}=${q.value}`).join("&") : ""}`,
        host: ["{{baseUrl}}"],
        path: ["v1", ...segments.slice(1)],
        query: query.length ? query : undefined,
      },
      description,
    },
  };
  if (body) {
    item.request.body = { mode: "raw", raw: body };
  }
  if (!item.event) delete item.event;
  return item;
}

function patchAuthFolder(authFolder) {
  for (const req of authFolder.item) {
    if (req.request?.body?.raw?.includes("username")) {
      req.request.body.raw = req.request.body.raw.replace(
        '"username": "{{username}}"',
        '"email": "{{email}}"',
      );
      if (req.name === "Auth - Login") {
        req.request.description =
          "Autenticación JWT por email corporativo. Guarda accessToken en jwtToken y refreshToken si aplica.";
      }
      if (req.name === "Auth - Refresh") {
        req.request.description =
          "Refresh reutiliza LoginRequest con email + password. Actualiza jwtToken automáticamente.";
      }
    }
    if (req.name === "Auth - Me") {
      req.event[0].script.exec.push(
        "pm.test('Profile includes email or username', function () {",
        "  pm.expect(json.username || json.email).to.be.a('string');",
        "});",
      );
    }
  }
}

function patchDashboardFolder(dashboardFolder) {
  const hasExecutive = dashboardFolder.item.some((i) => i.name === "Dashboard - Executive");
  if (!hasExecutive) {
    dashboardFolder.item.splice(1, 0, {
      name: "Dashboard - Executive",
      event: [
        {
          listen: "test",
          script: {
            type: "text/javascript",
            exec: [
              ...wrapperTest,
              "pm.test('Executive dashboard payload exists', function () { pm.expect(json).to.be.an('object'); });",
            ],
          },
        },
      ],
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "{{baseUrl}}/v1/dashboard/executive",
          host: ["{{baseUrl}}"],
          path: ["v1", "dashboard", "executive"],
        },
        description: "Vista ejecutiva consolidada del dashboard.",
      },
    });
  }
  const hasAlerts = dashboardFolder.item.some((i) => i.name === "Dashboard - Alerts");
  if (!hasAlerts) {
    dashboardFolder.item.splice(2, 0, {
      name: "Dashboard - Alerts",
      event: [
        {
          listen: "test",
          script: {
            type: "text/javascript",
            exec: [
              ...wrapperTest,
              "pm.test('Alerts payload is array or object', function () { pm.expect(json).to.exist; });",
            ],
          },
        },
      ],
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "{{baseUrl}}/v1/dashboard/alerts",
          host: ["{{baseUrl}}"],
          path: ["v1", "dashboard", "alerts"],
        },
        description: "Alertas operativas del dashboard.",
      },
    });
  }
}

const adminFolder = {
  name: "Administración",
  description: "Módulo de administración de usuarios, roles y permisos. Requiere permiso security:admin.",
  item: [
    {
      name: "Usuarios",
      item: [
        makeRequest({
          name: "Usuarios - Listar",
          method: "GET",
          urlPath: "v1/admin/users",
          query: [
            { key: "page", value: "0" },
            { key: "size", value: "50" },
            { key: "sort", value: "fullName,asc" },
          ],
          description: "Lista paginada de usuarios. Opcional: ?search=texto",
          tests: [
            ...wrapperTest,
            "pm.test('Pagination schema exists', function () {",
            "  pm.expect(json.content).to.be.an('array');",
            "  pm.expect(json.totalElements).to.exist;",
            "});",
            "if (json.content && json.content.length > 0) { pm.environment.set('userId', json.content[0].userId); }",
          ],
        }),
        makeRequest({
          name: "Usuarios - Crear",
          method: "POST",
          urlPath: "v1/admin/users",
          description: "Crea usuario con email, username, roles y contraseña inicial.",
          body: JSON.stringify(
            {
              username: "qa.user",
              email: "qa.user@local.dev",
              fullName: "Usuario QA Postman",
              password: "ChangeMe123",
              active: true,
              roleCodes: ["VIEWER"],
            },
            null,
            2,
          ),
          tests: [
            ...wrapperTest,
            "pm.test('User created', function () { pm.expect(json.userId).to.exist; });",
            "pm.environment.set('userId', json.userId);",
          ],
        }),
        makeRequest({
          name: "Usuarios - Obtener por ID",
          method: "GET",
          urlPath: "v1/admin/users/{{userId}}",
          description: "Detalle de usuario incluyendo roles y permisos efectivos.",
          tests: [...wrapperTest, "pm.test('User detail', function () { pm.expect(json.userId).to.exist; });"],
        }),
        makeRequest({
          name: "Usuarios - Editar",
          method: "PUT",
          urlPath: "v1/admin/users/{{userId}}",
          description: "Actualiza email, nombre y estado activo.",
          body: JSON.stringify(
            {
              email: "qa.user@local.dev",
              fullName: "Usuario QA Postman Actualizado",
              active: true,
            },
            null,
            2,
          ),
          tests: [...wrapperTest, "pm.test('User updated', function () { pm.expect(json.fullName).to.exist; });"],
        }),
        makeRequest({
          name: "Usuarios - Asignar roles",
          method: "PUT",
          urlPath: "v1/admin/users/{{userId}}/roles",
          description: "Asigna roles por código (roleCodes).",
          body: JSON.stringify({ roleCodes: ["VIEWER"] }, null, 2),
          tests: [...wrapperTest, "pm.test('Roles assigned', function () { pm.expect(json.roles).to.be.an('array'); });"],
        }),
        makeRequest({
          name: "Usuarios - Cambiar contraseña",
          method: "PUT",
          urlPath: "v1/admin/users/{{userId}}/password",
          description: "Reset administrativo de contraseña.",
          body: JSON.stringify({ newPassword: "ChangeMe123" }, null, 2),
          tests: ["pm.test('Status code is 200', function () { pm.response.to.have.status(200); });"],
        }),
        makeRequest({
          name: "Usuarios - Eliminar",
          method: "DELETE",
          urlPath: "v1/admin/users/{{userId}}",
          description: "Soft delete del usuario. Usar con usuario creado por Postman.",
          tests: ["pm.test('Status code is 200', function () { pm.response.to.have.status(200); });"],
        }),
      ],
    },
    {
      name: "Roles",
      item: [
        makeRequest({
          name: "Roles - Listar",
          method: "GET",
          urlPath: "v1/admin/roles",
          query: [
            { key: "page", value: "0" },
            { key: "size", value: "50" },
            { key: "sort", value: "name,asc" },
          ],
          description: "Lista paginada de roles.",
          tests: [
            ...wrapperTest,
            "pm.test('Pagination schema exists', function () { pm.expect(json.content).to.be.an('array'); });",
            "if (json.content && json.content.length > 0) { pm.environment.set('roleId', json.content[0].id); }",
          ],
        }),
        makeRequest({
          name: "Roles - Crear",
          method: "POST",
          urlPath: "v1/admin/roles",
          description: "Crea rol con código único.",
          body: JSON.stringify(
            {
              code: "QA_ROLE",
              name: "Rol QA Postman",
              description: "Rol temporal para pruebas Postman",
              active: true,
            },
            null,
            2,
          ),
          tests: [
            ...wrapperTest,
            "pm.test('Role created', function () { pm.expect(json.id).to.exist; });",
            "pm.environment.set('roleId', json.id);",
          ],
        }),
        makeRequest({
          name: "Roles - Obtener por ID",
          method: "GET",
          urlPath: "v1/admin/roles/{{roleId}}",
          description: "Detalle de rol con permisos asignados.",
          tests: [...wrapperTest, "pm.test('Role detail', function () { pm.expect(json.id).to.exist; });"],
        }),
        makeRequest({
          name: "Roles - Editar",
          method: "PUT",
          urlPath: "v1/admin/roles/{{roleId}}",
          description: "Actualiza nombre, descripción y estado.",
          body: JSON.stringify(
            {
              name: "Rol QA Postman Actualizado",
              description: "Rol temporal actualizado",
              active: true,
            },
            null,
            2,
          ),
          tests: [...wrapperTest, "pm.test('Role updated', function () { pm.expect(json.name).to.exist; });"],
        }),
        makeRequest({
          name: "Roles - Asignar permisos",
          method: "PUT",
          urlPath: "v1/admin/roles/{{roleId}}/permissions",
          description: "Asigna permisos por código (permissionCodes).",
          body: JSON.stringify({ permissionCodes: ["projects:read", "reports:read"] }, null, 2),
          tests: [
            ...wrapperTest,
            "pm.test('Permissions assigned', function () { pm.expect(json.permissionCodes).to.be.an('array'); });",
          ],
        }),
        makeRequest({
          name: "Roles - Eliminar",
          method: "DELETE",
          urlPath: "v1/admin/roles/{{roleId}}",
          description: "Elimina rol. Usar con rol creado por Postman.",
          tests: ["pm.test('Status code is 200', function () { pm.response.to.have.status(200); });"],
        }),
      ],
    },
    {
      name: "Permisos",
      item: [
        makeRequest({
          name: "Permisos - Listar agrupados",
          method: "GET",
          urlPath: "v1/admin/permissions",
          description: "Catálogo de permisos agrupados por módulo.",
          tests: [
            ...wrapperTest,
            "pm.test('Permission groups is array', function () { pm.expect(json).to.be.an('array'); });",
          ],
        }),
      ],
    },
  ],
};

collection.info.description =
  "Colección enterprise para validar el backend Spring Boot Coordinadora IT contra Oracle 19c. Auth por email. Alineada con controllers reales bajo /api/v1.";

const authFolder = collection.item.find((i) => i.name === "Auth");
const dashboardFolder = collection.item.find((i) => i.name === "Dashboard");
patchAuthFolder(authFolder);
patchDashboardFolder(dashboardFolder);

collection.item = collection.item.filter((i) => i.name !== "Administración");
const authIndex = collection.item.findIndex((i) => i.name === "Auth");
collection.item.splice(authIndex + 1, 0, adminFolder);

environment.values = environment.values.filter((v) => v.key !== "username");
const hasEmail = environment.values.some((v) => v.key === "email");
if (!hasEmail) {
  environment.values.splice(3, 0, {
    key: "email",
    value: "admin@local.dev",
    type: "default",
    enabled: true,
  });
} else {
  const emailVar = environment.values.find((v) => v.key === "email");
  emailVar.value = "admin@local.dev";
}

const ensureVar = (key, value) => {
  const existing = environment.values.find((v) => v.key === key);
  if (existing) {
    existing.value = value;
  } else {
    environment.values.push({ key, value, type: "default", enabled: true });
  }
};
ensureVar("userId", "1");
ensureVar("roleId", "1");

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2) + "\n");
fs.writeFileSync(envPath, JSON.stringify(environment, null, 2) + "\n");
console.log("Postman collection and environment updated.");
