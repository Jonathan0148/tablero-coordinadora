package com.coltefinanciera.itdashboard.portfolio.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record UpdateProjectRequest(
        @NotBlank String name,
        @NotBlank String pipelineStatusCode,
        LocalDate startDate
) {
}
