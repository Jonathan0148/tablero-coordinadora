package com.coltefinanciera.itdashboard.security;

import com.coltefinanciera.itdashboard.shared.api.ApiErrorData;
import com.coltefinanciera.itdashboard.shared.api.ApiErrorResponse;
import com.coltefinanciera.itdashboard.shared.api.ApiResponseCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class EnterpriseAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public EnterpriseAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        ApiResponseCode code = ApiResponseCode.AUTH_UNAUTHORIZED;
        response.setStatus(code.httpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiErrorData data = new ApiErrorData(code.traceCode(), "AUTH", request.getMethod() + " " + request.getRequestURI(), null);
        objectMapper.writeValue(response.getOutputStream(), ApiErrorResponse.of(code, code.message(), data));
    }
}
