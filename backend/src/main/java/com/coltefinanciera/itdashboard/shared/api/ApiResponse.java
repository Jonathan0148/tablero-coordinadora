package com.coltefinanciera.itdashboard.shared.api;

public record ApiResponse<T>(
        int code,
        String message,
        String userMessage,
        T data
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(
                ApiResponseCode.SUCCESS.code(),
                ApiResponseCode.SUCCESS.message(),
                ApiResponseCode.SUCCESS.userMessage(),
                data
        );
    }
}
