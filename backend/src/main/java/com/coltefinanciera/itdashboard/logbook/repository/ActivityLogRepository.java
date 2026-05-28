package com.coltefinanciera.itdashboard.logbook.repository;

import com.coltefinanciera.itdashboard.logbook.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Page<ActivityLog> findByDeleted(String deleted, Pageable pageable);

    Page<ActivityLog> findByDeletedAndWorkArea_Code(String deleted, String areaCode, Pageable pageable);
}
