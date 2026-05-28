package com.coltefinanciera.itdashboard.work.controller;

import com.coltefinanciera.itdashboard.shared.pagination.PageResponse;
import com.coltefinanciera.itdashboard.work.dto.CreateKanbanCardRequest;
import com.coltefinanciera.itdashboard.work.dto.KanbanCardResponse;
import com.coltefinanciera.itdashboard.work.dto.UpdateKanbanCardRequest;
import com.coltefinanciera.itdashboard.work.service.KanbanService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/kanban/cards")
public class KanbanController {
    private final KanbanService service;

    public KanbanController(KanbanService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<KanbanCardResponse> findAll(@PageableDefault(size = 50) Pageable pageable) {
        return PageResponse.from(service.findAll(pageable));
    }

    @PostMapping
    public KanbanCardResponse create(@Valid @RequestBody CreateKanbanCardRequest request) {
        return service.create(request);
    }

    @PutMapping("/{cardId}")
    public KanbanCardResponse update(@PathVariable Long cardId, @Valid @RequestBody UpdateKanbanCardRequest request) {
        return service.update(cardId, request);
    }

    @PatchMapping("/{cardId}/status")
    public KanbanCardResponse updateStatus(@PathVariable Long cardId, @RequestParam String statusCode) {
        return service.updateStatus(cardId, statusCode);
    }

    @DeleteMapping("/{cardId}")
    public void delete(@PathVariable Long cardId) {
        service.delete(cardId);
    }
}
