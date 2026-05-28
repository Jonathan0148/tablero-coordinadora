# FASE 5.1 - Enterprise API Error Standard

## Contrato obligatorio

Todas las respuestas REST del backend deben usar un sobre corporativo único:

```json
{
  "code": 0,
  "message": "Consulta realizada exitosamente",
  "userMessage": "Operación realizada exitosamente",
  "data": {}
}
```

- `code`: código corporativo numérico.
- `message`: mensaje técnico controlado para trazabilidad.
- `userMessage`: mensaje seguro para usuario final.
- `data`: payload del endpoint o detalle controlado del error.

## Respuestas exitosas

HTTP `200 OK`:

```json
{
  "code": 0,
  "message": "Consulta realizada exitosamente",
  "userMessage": "Operación realizada exitosamente",
  "data": {}
}
```

Para paginación:

```json
{
  "code": 0,
  "message": "Consulta realizada exitosamente",
  "userMessage": "Operación realizada exitosamente",
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0
  }
}
```

## Catálogo de errores

### Seguridad

HTTP `401 Unauthorized`, token ausente, expirado o inválido:

```json
{
  "code": 40101,
  "message": "Token JWT ausente o inválido",
  "userMessage": "No autorizado. Token inválido o ausente",
  "data": {
    "traceCode": "AUTH-40101",
    "module": "AUTH",
    "process": "GET /api/v1/projects",
    "details": null
  }
}
```

HTTP `403 Forbidden`, usuario autenticado sin permiso:

```json
{
  "code": 40301,
  "message": "Permisos insuficientes para ejecutar la operación",
  "userMessage": "No tiene permisos para ejecutar esta operación",
  "data": {
    "traceCode": "SECURITY-40301",
    "module": "SECURITY",
    "process": "POST /api/v1/projects",
    "details": null
  }
}
```

### Validación

- `42201` / `AUTH-42201`: login inválido.
- `42202` / `GLOBAL-42202`: DTO inválido.
- `42203` / `GLOBAL-42203`: campo obligatorio ausente.
- `42204` / `GLOBAL-42204`: formato JSON/parámetro inválido.
- `42205` / `GLOBAL-42205`: validación funcional de negocio.
- `42206` / `GLOBAL-42206`: recurso no encontrado.

Ejemplo:

```json
{
  "code": 42202,
  "message": "El campo email no cumple formato válido",
  "userMessage": "Los datos enviados no cumplen las validaciones requeridas",
  "data": {
    "traceCode": "GLOBAL-42202",
    "module": "GLOBAL",
    "process": "POST /api/v1/auth/login",
    "details": [
      {
        "field": "email",
        "message": "must be a well-formed email address"
      }
    ]
  }
}
```

### Conflictos de negocio

- `40901` / `PROJECT-40901`: proyecto duplicado.
- `40902` / `AUTH-40902`: usuario ya existe.
- `40903` / `GLOBAL-40903`: estado inválido de workflow.

### Infraestructura

- `50001` / `GLOBAL-50001`: error Oracle.
- `50002` / `GLOBAL-50002`: error Hibernate.
- `50003` / `AUTH-50003`: error JWT.
- `50004` / `GLOBAL-50004`: error integración externa.
- `50005` / `GLOBAL-50005`: NullPointer interno.
- `50006` / `GLOBAL-50006`: error compilación dinámica.
- `50099` / `GLOBAL-50099`: error interno no clasificado.

## Implementación

- `ApiResponse<T>`: sobre estándar para respuestas exitosas.
- `PagedApiResponse<T>`: sobre estándar para respuestas paginadas.
- `ApiErrorResponse`: sobre estándar para errores.
- `ApiResponseCode`: catálogo corporativo centralizado.
- `ApiResponseAdvice`: envuelve automáticamente respuestas de controladores.
- `GlobalExceptionHandler`: traduce excepciones de aplicación e infraestructura.
- `EnterpriseAuthenticationEntryPoint`: respuesta JSON para JWT ausente/inválido.
- `EnterpriseAccessDeniedHandler`: respuesta JSON para permisos insuficientes.

## Reglas para futuras APIs

1. Los controladores deben retornar DTOs de negocio, no construir JSON manual.
2. No usar respuestas arbitrarias ni `Map` como contrato público.
3. No usar `204 No Content`; incluso operaciones sin payload deben retornar el sobre estándar.
4. Los errores nuevos deben agregarse primero en `ApiResponseCode`.
5. Todo error debe separar `message` técnico de `userMessage` visible.
6. Los códigos de trazabilidad deben seguir el formato `MODULO-CODIGO`, por ejemplo `PROJECT-40901`.
7. JWT y seguridad siempre responden desde los handlers de Spring Security.
8. La colección Postman valida la existencia del sobre corporativo y lee el payload desde `data`.
