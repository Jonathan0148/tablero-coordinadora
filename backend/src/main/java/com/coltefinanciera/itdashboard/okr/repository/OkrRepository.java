package com.coltefinanciera.itdashboard.okr.repository;

import com.coltefinanciera.itdashboard.okr.entity.Okr;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OkrRepository extends JpaRepository<Okr, Long> {
    List<Okr> findByDeletedOrderBySortOrderAsc(String deleted);
}
