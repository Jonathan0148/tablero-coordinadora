package com.coltefinanciera.itdashboard.shared.exception;

import com.coltefinanciera.itdashboard.shared.api.ApiErrorData;
import com.coltefinanciera.itdashboard.shared.api.ApiErrorResponse;
import com.coltefinanciera.itdashboard.shared.api.ApiResponseCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.hibernate.HibernateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.UndeclaredThrowableException;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Value("${app.errors.expose-details:false}")
    private boolean exposeDetails;

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
        log.warn("Access denied at {} {}: {}", request.getMethod(), request.getRequestURI(), exception.getMessage());
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

    @ExceptionHandler(HttpMessageNotWritableException.class)
    ResponseEntity<ApiErrorResponse> handleNotWritable(HttpMessageNotWritableException exception, HttpServletRequest request) {
        log.error("JSON serialization error at {} {}", request.getMethod(), request.getRequestURI(), exception);
        return build(
                ApiResponseCode.INTERNAL_ERROR,
                ApiResponseCode.INTERNAL_ERROR.message(),
                request,
                diagnosticDetails(exception)
        );
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<ApiErrorResponse> handleDataAccess(DataAccessException exception, HttpServletRequest request) {
        log.error("Data access error at {} {}: {}", request.getMethod(), request.getRequestURI(), rootMessage(exception), exception);
        return build(
                ApiResponseCode.ORACLE_ERROR,
                exposeDetails ? rootMessage(exception) : ApiResponseCode.ORACLE_ERROR.message(),
                request,
                diagnosticDetails(exception)
        );
    }

    @ExceptionHandler(HibernateException.class)
    ResponseEntity<ApiErrorResponse> handleHibernate(HibernateException exception, HttpServletRequest request) {
        log.error("Hibernate error at {} {}: {}", request.getMethod(), request.getRequestURI(), exception.getMessage(), exception);
        return build(
                ApiResponseCode.HIBERNATE_ERROR,
                exposeDetails ? exception.getMessage() : ApiResponseCode.HIBERNATE_ERROR.message(),
                request,
                diagnosticDetails(exception)
        );
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception, HttpServletRequest request) {
        Throwable root = rootCause(exception);

        if (root instanceof AccessDeniedException accessDenied) {
            return handleAccessDenied(accessDenied, request);
        }
        if (root instanceof NotFoundException notFound) {
            return handleNotFound(notFound, request);
        }
        if (root instanceof BusinessException business) {
            return handleBusiness(business, request);
        }
        if (root instanceof DataAccessException dataAccess) {
            return handleDataAccess(dataAccess, request);
        }
        if (root instanceof HibernateException hibernate) {
            return handleHibernate(hibernate, request);
        }

        log.error(
                "Unhandled API error [{}] at {} {} | root=[{}] {}",
                exception.getClass().getSimpleName(),
                request.getMethod(),
                request.getRequestURI(),
                root.getClass().getSimpleName(),
                root.getMessage(),
                exception
        );

        ApiResponseCode code = root instanceof NullPointerException
                ? ApiResponseCode.NULL_POINTER_ERROR
                : ApiResponseCode.INTERNAL_ERROR;
        return build(code, code.message(), request, diagnosticDetails(exception));
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

    private Object diagnosticDetails(Throwable exception) {
        if (!exposeDetails) {
            return null;
        }
        Throwable root = rootCause(exception);
        return new DiagnosticErrorDetail(
                exception.getClass().getSimpleName(),
                root.getClass().getSimpleName(),
                root.getMessage()
        );
    }

    private static Throwable rootCause(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null && current.getCause() != current) {
            if (current instanceof UndeclaredThrowableException || current instanceof InvocationTargetException) {
                current = current.getCause();
                continue;
            }
            current = current.getCause();
        }
        return current;
    }

    private static String rootMessage(Throwable throwable) {
        return rootCause(throwable).getMessage();
    }

    private String module(ApiResponseCode code) {
        int separator = code.traceCode().indexOf('-');
        return separator > 0 ? code.traceCode().substring(0, separator) : "GLOBAL";
    }

    private String process(HttpServletRequest request) {
        return request.getMethod() + " " + request.getRequestURI();
    }

    private record DiagnosticErrorDetail(
            String exceptionType,
            String rootCauseType,
            String rootCauseMessage
    ) {
    }
}
