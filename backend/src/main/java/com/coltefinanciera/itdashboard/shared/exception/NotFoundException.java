package com.coltefinanciera.itdashboard.shared.exception;

import com.coltefinanciera.itdashboard.shared.api.ApiResponseCode;

public class NotFoundException extends RuntimeException {

    private final ApiResponseCode responseCode;

    public NotFoundException(String message) {
        super(message);
        this.responseCode = ApiResponseCode.RESOURCE_NOT_FOUND;
    }

    public ApiResponseCode responseCode() {
        return responseCode;
    }
}
