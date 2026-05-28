package com.coltefinanciera.itdashboard.catalog.repository;

import com.coltefinanciera.itdashboard.catalog.entity.OkrActivityStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OkrActivityStatusRepository extends JpaRepository<OkrActivityStatus, Long> {
    Optional<OkrActivityStatus> findByCode(String code);
}
