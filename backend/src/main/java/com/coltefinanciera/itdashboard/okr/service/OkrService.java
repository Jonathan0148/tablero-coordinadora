package com.coltefinanciera.itdashboard.okr.service;

import com.coltefinanciera.itdashboard.catalog.repository.OkrActivityStatusRepository;
import com.coltefinanciera.itdashboard.okr.dto.OkrResponse;
import com.coltefinanciera.itdashboard.okr.dto.UpdateOkrActivityRequest;
import com.coltefinanciera.itdashboard.okr.entity.Okr;
import com.coltefinanciera.itdashboard.okr.entity.OkrActivity;
import com.coltefinanciera.itdashboard.okr.repository.OkrActivityRepository;
import com.coltefinanciera.itdashboard.okr.repository.OkrRepository;
import com.coltefinanciera.itdashboard.shared.exception.BusinessException;
import com.coltefinanciera.itdashboard.shared.exception.NotFoundException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OkrService {
    private final OkrRepository repository;
    private final OkrActivityRepository activityRepository;
    private final OkrActivityStatusRepository okrActivityStatusRepository;

    public OkrService(
            OkrRepository repository,
            OkrActivityRepository activityRepository,
            OkrActivityStatusRepository okrActivityStatusRepository
    ) {
        this.repository = repository;
        this.activityRepository = activityRepository;
        this.okrActivityStatusRepository = okrActivityStatusRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_okrs:read')")
    public List<OkrResponse> findAll() {
        return repository.findByDeletedOrderBySortOrderAsc("N").stream().map(this::toResponse).toList();
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_okrs:update')")
    public OkrResponse.Activity updateActivity(Long okrId, Long activityId, UpdateOkrActivityRequest request) {
        Okr okr = repository.findById(okrId)
                .filter(item -> !item.isDeleted())
                .orElseThrow(() -> new NotFoundException("OKR no encontrado"));
        OkrActivity activity = activityRepository.findByIdAndDeleted(activityId, "N")
                .filter(item -> item.getOkr().getId().equals(okr.getId()))
                .orElseThrow(() -> new NotFoundException("Actividad OKR no encontrada"));

        if (request.pct() != null) {
            if (request.pct().compareTo(BigDecimal.ZERO) < 0 || request.pct().compareTo(new BigDecimal("100")) > 0) {
                throw new BusinessException("El porcentaje debe estar entre 0 y 100");
            }
            activity.setPct(request.pct());
        }
        if (StringUtils.hasText(request.statusCode())) {
            activity.setStatus(okrActivityStatusRepository.findByCode(request.statusCode())
                    .orElseThrow(() -> new NotFoundException("Estado de actividad OKR no encontrado")));
        }
        return toActivity(activity);
    }

    private OkrResponse toResponse(Okr okr) {
        return new OkrResponse(okr.getId(), okr.getLegacyId(), okr.getName(),
                okr.getActivities().stream().map(this::toActivity).toList());
    }

    private OkrResponse.Activity toActivity(OkrActivity activity) {
        return new OkrResponse.Activity(
                activity.getId(),
                activity.getLegacyId(),
                activity.getPct(),
                activity.getStatus().getCode(),
                activity.getText(),
                activity.getResponsible(),
                activity.getDependency(),
                activity.getDeliverable()
        );
    }
}
