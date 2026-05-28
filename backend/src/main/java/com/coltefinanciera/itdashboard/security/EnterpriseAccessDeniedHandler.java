package com.coltefinanciera.itdashboard.security;

import com.coltefinanciera.itdashboard.shared.api.ApiErrorData;
import com.coltefinanciera.itdashboard.shared.api.ApiErrorResponse;
import com.coltefinanciera.itdashboard.shared.api.ApiResponseCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class EnterpriseAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public EnterpriseAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {
        ApiResponseCode code = ApiResponseCode.SECURITY_FORBIDDEN;
        response.setStatus(code.httpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiErrorData data = new ApiErrorData(code.traceCode(), "SECURITY", request.getMethod() + " " + request.getRequestURI(), null);
        objectMapper.writeValue(response.getOutputStream(), ApiErrorResponse.of(code, code.message(), data));
    }
}
