package com.coltefinanciera.itdashboard.work.service;

import com.coltefinanciera.itdashboard.catalog.repository.KanbanStatusRepository;
import com.coltefinanciera.itdashboard.catalog.repository.PriorityLevelRepository;
import com.coltefinanciera.itdashboard.catalog.repository.WorkAreaRepository;
import com.coltefinanciera.itdashboard.portfolio.repository.ProjectRepository;
import com.coltefinanciera.itdashboard.shared.exception.NotFoundException;
import com.coltefinanciera.itdashboard.work.dto.CreateKanbanCardRequest;
import com.coltefinanciera.itdashboard.work.dto.KanbanCardResponse;
import com.coltefinanciera.itdashboard.work.dto.UpdateKanbanCardRequest;
import com.coltefinanciera.itdashboard.work.entity.KanbanCard;
import com.coltefinanciera.itdashboard.work.repository.KanbanCardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class KanbanService {
    private final KanbanCardRepository repository;
    private final WorkAreaRepository workAreaRepository;
    private final PriorityLevelRepository priorityLevelRepository;
    private final KanbanStatusRepository kanbanStatusRepository;
    private final ProjectRepository projectRepository;

    public KanbanService(
            KanbanCardRepository repository,
            WorkAreaRepository workAreaRepository,
            PriorityLevelRepository priorityLevelRepository,
            KanbanStatusRepository kanbanStatusRepository,
            ProjectRepository projectRepository
    ) {
        this.repository = repository;
        this.workAreaRepository = workAreaRepository;
        this.priorityLevelRepository = priorityLevelRepository;
        this.kanbanStatusRepository = kanbanStatusRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_kanban:read')")
    public Page<KanbanCardResponse> findAll(Pageable pageable) {
        return repository.findByDeleted("N", pageable).map(this::toResponse);
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_kanban:create')")
    public KanbanCardResponse create(CreateKanbanCardRequest request) {
        KanbanCard card = new KanbanCard();
        card.setText(request.text());
        card.setWorkArea(workAreaRepository.findByCode(request.areaCode()).orElseThrow(() -> new NotFoundException("Área no encontrada")));
        card.setPriorityLevel(priorityLevelRepository.findByCode(request.priorityCode()).orElseThrow(() -> new NotFoundException("Prioridad no encontrada")));
        card.setKanbanStatus(kanbanStatusRepository.findByCode(request.statusCode()).orElseThrow(() -> new NotFoundException("Estado Kanban no encontrado")));
        card.setDueDate(request.dueDate());
        card.setReminderAt(request.reminderAt());
        card.setCreatedAtOriginal(LocalDateTime.now());
        applyProject(card, request.projectId());
        return toResponse(repository.save(card));
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_kanban:update')")
    public KanbanCardResponse update(Long id, UpdateKanbanCardRequest request) {
        KanbanCard card = getActiveCard(id);
        card.setText(request.text());
        card.setWorkArea(workAreaRepository.findByCode(request.areaCode()).orElseThrow(() -> new NotFoundException("Área no encontrada")));
        card.setPriorityLevel(priorityLevelRepository.findByCode(request.priorityCode()).orElseThrow(() -> new NotFoundException("Prioridad no encontrada")));
        card.setKanbanStatus(kanbanStatusRepository.findByCode(request.statusCode()).orElseThrow(() -> new NotFoundException("Estado Kanban no encontrado")));
        card.setDueDate(request.dueDate());
        card.setReminderAt(request.reminderAt());
        applyProject(card, request.projectId());
        return toResponse(card);
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_kanban:update')")
    public KanbanCardResponse updateStatus(Long id, String statusCode) {
        KanbanCard card = getActiveCard(id);
        card.setKanbanStatus(kanbanStatusRepository.findByCode(statusCode).orElseThrow(() -> new NotFoundException("Estado Kanban no encontrado")));
        return toResponse(card);
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_kanban:delete')")
    public void delete(Long id) {
        getActiveCard(id).markDeleted();
    }

    private KanbanCard getActiveCard(Long id) {
        return repository.findById(id)
                .filter(card -> !card.isDeleted())
                .orElseThrow(() -> new NotFoundException("Actividad no encontrada"));
    }

    private void applyProject(KanbanCard card, Long projectId) {
        if (projectId == null) {
            card.setProject(null);
            return;
        }
        card.setProject(projectRepository.findById(projectId)
                .filter(project -> !project.isDeleted())
                .orElseThrow(() -> new NotFoundException("Proyecto no encontrado")));
    }

    private KanbanCardResponse toResponse(KanbanCard card) {
        return new KanbanCardResponse(
                card.getId(), card.getLegacyId(), card.getText(),
                card.getWorkArea().getCode(), card.getPriorityLevel().getCode(), card.getKanbanStatus().getCode(),
                card.getDueDate(), card.getReminderAt(), card.getProject() == null ? null : card.getProject().getId()
        );
    }
}
