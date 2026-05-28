package com.coltefinanciera.itdashboard.dashboard.dto;

public record AlertItemResponse(
        String type,
        String text,
        String tag,
        String scope,
        Long projectId,
        Long kanbanCardId
) {
}
