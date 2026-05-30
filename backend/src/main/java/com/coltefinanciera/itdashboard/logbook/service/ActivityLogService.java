package com.coltefinanciera.itdashboard.logbook.service;

import com.coltefinanciera.itdashboard.catalog.repository.WorkAreaRepository;
import com.coltefinanciera.itdashboard.logbook.dto.ActivityLogDto;
import com.coltefinanciera.itdashboard.logbook.entity.ActivityLog;
import com.coltefinanciera.itdashboard.logbook.repository.ActivityLogRepository;
import com.coltefinanciera.itdashboard.shared.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
public class ActivityLogService {
    private final ActivityLogRepository repository;
    private final WorkAreaRepository workAreaRepository;

    public ActivityLogService(ActivityLogRepository repository, WorkAreaRepository workAreaRepository) {
        this.repository = repository;
        this.workAreaRepository = workAreaRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_logs:read')")
    public Page<ActivityLogDto> findAll(String areaCode, Pageable pageable) {
        Page<ActivityLog> page = StringUtils.hasText(areaCode)
                ? repository.findByDeletedAndWorkArea_Code("N", areaCode, pageable)
                : repository.findByDeleted("N", pageable);
        return page.map(this::toDto);
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_logs:create')")
    public ActivityLogDto create(ActivityLogDto request) {
        ActivityLog log = new ActivityLog();
        log.setText(request.text());
        log.setWorkArea(workAreaRepository.findByCode(request.areaCode()).orElseThrow(() -> new NotFoundException("Área no encontrada")));
        log.setLoggedAtOriginal(request.loggedAtOriginal() == null ? LocalDateTime.now() : request.loggedAtOriginal());
        return toDto(repository.save(log));
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_logs:delete')")
    public void delete(Long id) {
        ActivityLog log = repository.findById(id)
                .filter(item -> !item.isDeleted())
                .orElseThrow(() -> new NotFoundException("Registro de bitácora no encontrado"));
        log.markDeleted();
    }

    private ActivityLogDto toDto(ActivityLog log) {
        return new ActivityLogDto(log.getId(), log.getLegacyId(), log.getText(), log.getWorkArea().getCode(), log.getLoggedAtOriginal());
    }
}
