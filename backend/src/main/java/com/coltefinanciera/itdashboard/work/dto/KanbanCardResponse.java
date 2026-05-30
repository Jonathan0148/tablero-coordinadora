package com.coltefinanciera.itdashboard.work.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record KanbanCardResponse(
        Long id,
        String legacyId,
        String text,
        String areaCode,
        String priorityCode,
        String statusCode,
        LocalDate dueDate,
        LocalDateTime reminderAt,
        Long projectId
) {
}
