package com.coltefinanciera.itdashboard.catalog.repository;

import com.coltefinanciera.itdashboard.catalog.entity.KanbanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KanbanStatusRepository extends JpaRepository<KanbanStatus, Long> {
    Optional<KanbanStatus> findByCode(String code);
}
