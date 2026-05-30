package com.coltefinanciera.itdashboard.tracking.service;

import com.coltefinanciera.itdashboard.catalog.entity.ResponsibleArea;
import com.coltefinanciera.itdashboard.catalog.entity.StopperImpact;
import com.coltefinanciera.itdashboard.catalog.repository.*;
import com.coltefinanciera.itdashboard.portfolio.entity.Project;
import com.coltefinanciera.itdashboard.portfolio.service.ProjectService;
import com.coltefinanciera.itdashboard.shared.exception.BusinessException;
import com.coltefinanciera.itdashboard.shared.exception.NotFoundException;
import com.coltefinanciera.itdashboard.tracking.dto.CreateProjectUpdateRequest;
import com.coltefinanciera.itdashboard.tracking.dto.ProjectUpdateResponse;
import com.coltefinanciera.itdashboard.tracking.entity.ProjectUpdate;
import com.coltefinanciera.itdashboard.tracking.mapper.ProjectUpdateMapper;
import com.coltefinanciera.itdashboard.tracking.repository.ProjectUpdateRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
public class ProjectUpdateService {

    private final ProjectUpdateRepository repository;
    private final ProjectService projectService;
    private final ExecutiveStatusRepository executiveStatusRepository;
    private final TrafficLightRepository trafficLightRepository;
    private final StopperImpactRepository stopperImpactRepository;
    private final ResponsibleAreaRepository responsibleAreaRepository;
    private final TrafficLightCalculator trafficLightCalculator;
    private final ProjectUpdateMapper mapper;

    public ProjectUpdateService(
            ProjectUpdateRepository repository,
            ProjectService projectService,
            ExecutiveStatusRepository executiveStatusRepository,
            TrafficLightRepository trafficLightRepository,
            StopperImpactRepository stopperImpactRepository,
            ResponsibleAreaRepository responsibleAreaRepository,
            TrafficLightCalculator trafficLightCalculator,
            ProjectUpdateMapper mapper
    ) {
        this.repository = repository;
        this.projectService = projectService;
        this.executiveStatusRepository = executiveStatusRepository;
        this.trafficLightRepository = trafficLightRepository;
        this.stopperImpactRepository = stopperImpactRepository;
        this.responsibleAreaRepository = responsibleAreaRepository;
        this.trafficLightCalculator = trafficLightCalculator;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_project-updates:read')")
    public Page<ProjectUpdateResponse> findByProject(Long projectId, Pageable pageable) {
        return repository.findByProjectIdAndDeleted(projectId, "N", pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_project-updates:read')")
    public ProjectUpdateResponse currentStatus(Long projectId) {
        return repository.findFirstByProjectIdAndDeletedOrderByUpdatedAtOriginalDescIdDesc(projectId, "N")
                .map(mapper::toResponse)
                .orElseThrow(() -> new NotFoundException("El proyecto no tiene actualizaciones"));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_project-updates:read')")
    public ProjectUpdateResponse statusAt(Long projectId, LocalDateTime at) {
        return repository.findStatusAt(projectId, at, PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .map(mapper::toResponse)
                .orElseThrow(() -> new NotFoundException("No hay estado histórico para la fecha solicitada"));
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_project-updates:create')")
    public ProjectUpdateResponse create(Long projectId, CreateProjectUpdateRequest request) {
        if (request.requiresCoordination() && !StringUtils.hasText(request.coordinationDesc())) {
            throw new BusinessException("La descripción de coordinación es obligatoria");
        }

        Project project = projectService.getActiveProject(projectId);
        ProjectUpdate update = new ProjectUpdate();
        update.setProject(project);
        update.setUpdatedAtOriginal(LocalDateTime.now());
        update.setExecutiveStatus(executiveStatusRepository.findByCode(request.executiveStatusCode())
                .orElseThrow(() -> new NotFoundException("Estado ejecutivo no encontrado")));
        update.setTrafficLight(trafficLightRepository.findByCode(trafficLightCalculator.calculate(request))
                .orElseThrow(() -> new NotFoundException("Semáforo no encontrado")));
        update.setSummary(request.summary());
        update.setPendingItems(request.pendingItems());
        update.setHasStopper(request.hasStopper() ? "Y" : "N");
        update.setStopperDesc(request.stopperDesc());
        update.setStopperOwner(request.stopperOwner());
        update.setStopperImpact(findStopperImpact(request.stopperImpactCode()));
        update.setRelevantRisks(request.relevantRisks());
        update.setNextMilestone(request.nextMilestone());
        update.setNextMilestoneDate(request.nextMilestoneDate());
        update.setPendingDecisions(request.pendingDecisions());
        update.setRequiresCoordination(request.requiresCoordination() ? "Y" : "N");
        update.setCoordinationDesc(request.coordinationDesc());
        update.setResponsibleArea(findResponsibleArea(request.responsibleAreaCode()));
        update.setResponsibleAction(request.responsibleAction());
        update.setAdditionalNotes(request.additionalNotes());
        project.setLegacyUpdatedAt(update.getUpdatedAtOriginal());
        return mapper.toResponse(repository.save(update));
    }

    private StopperImpact findStopperImpact(String code) {
        if (!StringUtils.hasText(code)) {
            return null;
        }
        return stopperImpactRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Impacto de stopper no encontrado"));
    }

    private ResponsibleArea findResponsibleArea(String code) {
        if (!StringUtils.hasText(code)) {
            return null;
        }
        return responsibleAreaRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Área responsable no encontrada"));
    }
}
