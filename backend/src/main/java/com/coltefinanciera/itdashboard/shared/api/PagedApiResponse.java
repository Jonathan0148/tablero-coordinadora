package com.coltefinanciera.itdashboard.shared.api;

import com.coltefinanciera.itdashboard.shared.pagination.PageResponse;

public record PagedApiResponse<T>(
        int code,
        String message,
        String userMessage,
        PageResponse<T> data
) {
    public static <T> PagedApiResponse<T> success(PageResponse<T> data) {
        return new PagedApiResponse<>(
                ApiResponseCode.SUCCESS.code(),
                ApiResponseCode.SUCCESS.message(),
                ApiResponseCode.SUCCESS.userMessage(),
                data
        );
    }
}
