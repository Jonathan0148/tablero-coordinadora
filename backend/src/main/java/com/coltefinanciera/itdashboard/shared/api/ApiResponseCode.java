package com.coltefinanciera.itdashboard.shared.api;

import org.springframework.http.HttpStatus;

public enum ApiResponseCode {
    SUCCESS(0, "GLOBAL-00000", HttpStatus.OK,
            "Consulta realizada exitosamente",
            "Operación realizada exitosamente"),

    AUTH_UNAUTHORIZED(40101, "AUTH-40101", HttpStatus.UNAUTHORIZED,
            "Token JWT ausente o inválido",
            "No autorizado. Token inválido o ausente"),
    AUTH_INVALID_LOGIN(42201, "AUTH-42201", HttpStatus.UNPROCESSABLE_ENTITY,
            "Credenciales inválidas",
            "Los datos enviados no cumplen las validaciones requeridas"),

    SECURITY_FORBIDDEN(40301, "SECURITY-40301", HttpStatus.FORBIDDEN,
            "Permisos insuficientes para ejecutar la operación",
            "No tiene permisos para ejecutar esta operación"),

    VALIDATION_DTO_INVALID(42202, "GLOBAL-42202", HttpStatus.UNPROCESSABLE_ENTITY,
            "Datos inválidos",
            "Los datos enviados no cumplen las validaciones requeridas"),
    VALIDATION_REQUIRED_FIELD(42203, "GLOBAL-42203", HttpStatus.UNPROCESSABLE_ENTITY,
            "Campo obligatorio ausente",
            "Los datos enviados no cumplen las validaciones requeridas"),
    VALIDATION_FORMAT_INVALID(42204, "GLOBAL-42204", HttpStatus.UNPROCESSABLE_ENTITY,
            "Formato inválido",
            "Los datos enviados no cumplen las validaciones requeridas"),
    VALIDATION_BUSINESS_RULE(42205, "GLOBAL-42205", HttpStatus.UNPROCESSABLE_ENTITY,
            "Error de validación de negocio",
            "Los datos enviados no cumplen las validaciones requeridas"),

    PROJECT_DUPLICATED(40901, "PROJECT-40901", HttpStatus.CONFLICT,
            "Ya existe un proyecto con el mismo código",
            "Conflicto de datos o estado en la operación"),
    USER_ALREADY_EXISTS(40902, "AUTH-40902", HttpStatus.CONFLICT,
            "El usuario ya existe",
            "Conflicto de datos o estado en la operación"),
    WORKFLOW_INVALID_STATE(40903, "GLOBAL-40903", HttpStatus.CONFLICT,
            "Estado inválido de workflow",
            "Conflicto de datos o estado en la operación"),

    RESOURCE_NOT_FOUND(42206, "GLOBAL-42206", HttpStatus.UNPROCESSABLE_ENTITY,
            "Recurso no encontrado",
            "Los datos enviados no cumplen las validaciones requeridas"),

    ORACLE_ERROR(50001, "GLOBAL-50001", HttpStatus.INTERNAL_SERVER_ERROR,
            "Error Oracle",
            "Error interno del servicio. Intente nuevamente o contacte soporte"),
    HIBERNATE_ERROR(50002, "GLOBAL-50002", HttpStatus.INTERNAL_SERVER_ERROR,
            "Error Hibernate",
            "Error interno del servicio. Intente nuevamente o contacte soporte"),
    JWT_ERROR(50003, "AUTH-50003", HttpStatus.INTERNAL_SERVER_ERROR,
            "Error JWT",
            "Error interno del servicio. Intente nuevamente o contacte soporte"),
    EXTERNAL_INTEGRATION_ERROR(50004, "GLOBAL-50004", HttpStatus.INTERNAL_SERVER_ERROR,
            "Error integración externa",
            "Error interno del servicio. Intente nuevamente o contacte soporte"),
    NULL_POINTER_ERROR(50005, "GLOBAL-50005", HttpStatus.INTERNAL_SERVER_ERROR,
            "NullPointer interno",
            "Error interno del servicio. Intente nuevamente o contacte soporte"),
    DYNAMIC_COMPILATION_ERROR(50006, "GLOBAL-50006", HttpStatus.INTERNAL_SERVER_ERROR,
            "Error compilación dinámica",
            "Error interno del servicio. Intente nuevamente o contacte soporte"),
    INTERNAL_ERROR(50099, "GLOBAL-50099", HttpStatus.INTERNAL_SERVER_ERROR,
            "Error interno del servidor",
            "Error interno del servicio. Intente nuevamente o contacte soporte");

    private final int code;
    private final String traceCode;
    private final HttpStatus httpStatus;
    private final String message;
    private final String userMessage;

    ApiResponseCode(int code, String traceCode, HttpStatus httpStatus, String message, String userMessage) {
        this.code = code;
        this.traceCode = traceCode;
        this.httpStatus = httpStatus;
        this.message = message;
        this.userMessage = userMessage;
    }

    public int code() {
        return code;
    }

    public String traceCode() {
        return traceCode;
    }

    public HttpStatus httpStatus() {
        return httpStatus;
    }

    public String message() {
        return message;
    }

    public String userMessage() {
        return userMessage;
    }
}
