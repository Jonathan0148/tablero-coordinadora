package com.coltefinanciera.itdashboard.work.repository;

import com.coltefinanciera.itdashboard.work.entity.KanbanCard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface KanbanCardRepository extends JpaRepository<KanbanCard, Long> {
    Page<KanbanCard> findByDeleted(String deleted, Pageable pageable);

    List<KanbanCard> findByDeleted(String deleted);

    @Query("""
            select k.project.id, count(k)
            from KanbanCard k
            where k.deleted = 'N'
              and k.project.id in :projectIds
              and k.kanbanStatus.code <> 'HECHO'
            group by k.project.id
            """)
    List<Object[]> countOpenTasksByProjectIds(List<Long> projectIds);
}
