package com.coltefinanciera.itdashboard.shared.exception;

import com.coltefinanciera.itdashboard.shared.api.ApiResponseCode;

public class BusinessException extends RuntimeException {

    private final ApiResponseCode responseCode;

    public BusinessException(String message) {
        this(ApiResponseCode.VALIDATION_BUSINESS_RULE, message);
    }

    public BusinessException(ApiResponseCode responseCode, String message) {
        super(message);
        this.responseCode = responseCode;
    }

    public BusinessException(ApiResponseCode responseCode) {
        this(responseCode, responseCode.message());
    }

    public ApiResponseCode responseCode() {
        return responseCode;
    }
}
