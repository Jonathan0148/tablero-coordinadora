package com.coltefinanciera.itdashboard.catalog.repository;

import com.coltefinanciera.itdashboard.catalog.entity.ResponsibleArea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResponsibleAreaRepository extends JpaRepository<ResponsibleArea, Long> {
    Optional<ResponsibleArea> findByCode(String code);
}
