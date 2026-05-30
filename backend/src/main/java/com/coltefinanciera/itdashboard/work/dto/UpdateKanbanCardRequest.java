package com.coltefinanciera.itdashboard.work.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UpdateKanbanCardRequest(
        @NotBlank String text,
        @NotBlank String areaCode,
        @NotBlank String priorityCode,
        @NotBlank String statusCode,
        LocalDate dueDate,
        LocalDateTime reminderAt,
        Long projectId
) {
}
