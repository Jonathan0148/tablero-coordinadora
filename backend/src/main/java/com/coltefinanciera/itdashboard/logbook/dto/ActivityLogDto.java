package com.coltefinanciera.itdashboard.logbook.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.OffsetDateTime;

public record ActivityLogDto(
        Long id,
        String legacyId,
        @NotBlank String text,
        @NotBlank String areaCode,
        OffsetDateTime loggedAtOriginal
) {
}
