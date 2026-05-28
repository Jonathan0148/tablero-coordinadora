package com.coltefinanciera.itdashboard.tracking.repository;

import com.coltefinanciera.itdashboard.tracking.entity.ProjectUpdate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ProjectUpdateRepository extends JpaRepository<ProjectUpdate, Long> {

    Page<ProjectUpdate> findByProjectIdAndDeleted(Long projectId, String deleted, Pageable pageable);

    Optional<ProjectUpdate> findFirstByProjectIdAndDeletedOrderByUpdatedAtOriginalDescIdDesc(Long projectId, String deleted);

    @Query("""
            select pu from ProjectUpdate pu
            where pu.project.id = :projectId
              and pu.deleted = 'N'
              and pu.updatedAtOriginal <= :at
            order by pu.updatedAtOriginal desc, pu.id desc
            """)
    Page<ProjectUpdate> findStatusAt(Long projectId, OffsetDateTime at, Pageable pageable);

    @Query("""
            select pu from ProjectUpdate pu
            where pu.deleted = 'N'
              and pu.project.id in :projectIds
              and pu.id = (
                  select max(pu2.id) from ProjectUpdate pu2
                  where pu2.deleted = 'N'
                    and pu2.project.id = pu.project.id
              )
            """)
    List<ProjectUpdate> findLatestByProjectIds(List<Long> projectIds);
}
