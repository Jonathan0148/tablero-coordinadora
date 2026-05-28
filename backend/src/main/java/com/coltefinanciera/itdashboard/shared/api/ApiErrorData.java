package com.coltefinanciera.itdashboard.shared.api;

public record ApiErrorData(
        String traceCode,
        String module,
        String process,
        Object details
) {
}
