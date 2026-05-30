package com.coltefinanciera.itdashboard.logbook.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record ActivityLogDto(
        Long id,
        String legacyId,
        @NotBlank String text,
        @NotBlank String areaCode,
        LocalDateTime loggedAtOriginal
) {
}
