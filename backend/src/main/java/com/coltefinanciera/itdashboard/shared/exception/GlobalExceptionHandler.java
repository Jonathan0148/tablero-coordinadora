package com.coltefinanciera.itdashboard.shared.exception;

import com.coltefinanciera.itdashboard.shared.api.ApiErrorData;
import com.coltefinanciera.itdashboard.shared.api.ApiErrorResponse;
import com.coltefinanciera.itdashboard.shared.api.ApiResponseCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.hibernate.HibernateException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<ApiErrorResponse> handleNotFound(NotFoundException exception, HttpServletRequest request) {
        return build(exception.responseCode(), exception.getMessage(), request, null);
    }

    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ApiErrorResponse> handleBusiness(BusinessException exception, HttpServletRequest request) {
        return build(exception.responseCode(), exception.getMessage(), request, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException exception, HttpServletRequest request) {
        return build(ApiResponseCode.SECURITY_FORBIDDEN, ApiResponseCode.SECURITY_FORBIDDEN.message(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        List<FieldErrorDetail> details = exception.getBindingResult().getFieldErrors().stream()
                .map(this::toDetail)
                .toList();
        String message = details.isEmpty() ? ApiResponseCode.VALIDATION_DTO_INVALID.message() : details.getFirst().message();
        return build(ApiResponseCode.VALIDATION_DTO_INVALID, message, request, details);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiErrorResponse> handleConstraintViolation(ConstraintViolationException exception, HttpServletRequest request) {
        List<FieldErrorDetail> details = exception.getConstraintViolations().stream()
                .map(this::toDetail)
                .toList();
        String message = details.isEmpty() ? ApiResponseCode.VALIDATION_BUSINESS_RULE.message() : details.getFirst().message();
        return build(ApiResponseCode.VALIDATION_BUSINESS_RULE, message, request, details);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    ResponseEntity<ApiErrorResponse> handleMissingParameter(MissingServletRequestParameterException exception, HttpServletRequest request) {
        FieldErrorDetail detail = new FieldErrorDetail(exception.getParameterName(), "Campo obligatorio ausente");
        return build(ApiResponseCode.VALIDATION_REQUIRED_FIELD, detail.message(), request, List.of(detail));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiErrorResponse> handleUnreadableMessage(HttpMessageNotReadableException exception, HttpServletRequest request) {
        return build(ApiResponseCode.VALIDATION_FORMAT_INVALID, exception.getMostSpecificCause().getMessage(), request, null);
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<ApiErrorResponse> handleDataAccess(DataAccessException exception, HttpServletRequest request) {
        log.error("Data access API error at {} {}", request.getMethod(), request.getRequestURI(), exception);
        return build(ApiResponseCode.ORACLE_ERROR, exception.getMostSpecificCause().getMessage(), request, null);
    }

    @ExceptionHandler(HibernateException.class)
    ResponseEntity<ApiErrorResponse> handleHibernate(HibernateException exception, HttpServletRequest request) {
        log.error("Hibernate API error at {} {}", request.getMethod(), request.getRequestURI(), exception);
        return build(ApiResponseCode.HIBERNATE_ERROR, exception.getMessage(), request, null);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception, HttpServletRequest request) {
        log.error("Unhandled API error at {} {}", request.getMethod(), request.getRequestURI(), exception);
        ApiResponseCode code = exception instanceof NullPointerException
                ? ApiResponseCode.NULL_POINTER_ERROR
                : ApiResponseCode.INTERNAL_ERROR;
        return build(code, code.message(), request, null);
    }

    private FieldErrorDetail toDetail(FieldError fieldError) {
        return new FieldErrorDetail(fieldError.getField(), fieldError.getDefaultMessage());
    }

    private FieldErrorDetail toDetail(ConstraintViolation<?> violation) {
        return new FieldErrorDetail(violation.getPropertyPath().toString(), violation.getMessage());
    }

    private ResponseEntity<ApiErrorResponse> build(
            ApiResponseCode code,
            String message,
            HttpServletRequest request,
            Object details
    ) {
        ApiErrorData data = new ApiErrorData(code.traceCode(), module(code), process(request), details);
        return ResponseEntity.status(code.httpStatus()).body(ApiErrorResponse.of(code, message, data));
    }

    private String module(ApiResponseCode code) {
        int separator = code.traceCode().indexOf('-');
        return separator > 0 ? code.traceCode().substring(0, separator) : "GLOBAL";
    }

    private String process(HttpServletRequest request) {
        return request.getMethod() + " " + request.getRequestURI();
    }
}
