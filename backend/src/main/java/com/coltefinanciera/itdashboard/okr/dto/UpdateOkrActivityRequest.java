package com.coltefinanciera.itdashboard.okr.dto;

import java.math.BigDecimal;

public record UpdateOkrActivityRequest(
        BigDecimal pct,
        String statusCode
) {
}
