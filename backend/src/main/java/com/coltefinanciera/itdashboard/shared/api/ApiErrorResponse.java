package com.coltefinanciera.itdashboard.shared.api;

public record ApiErrorResponse(
        int code,
        String message,
        String userMessage,
        Object data
) {
    public static ApiErrorResponse of(ApiResponseCode code, String message, Object data) {
        return new ApiErrorResponse(
                code.code(),
                message == null || message.isBlank() ? code.message() : message,
                code.userMessage(),
                data
        );
    }
}
