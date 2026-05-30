package com.coltefinanciera.itdashboard.portfolio.specification;

import com.coltefinanciera.itdashboard.portfolio.dto.ProjectFilterRequest;
import com.coltefinanciera.itdashboard.portfolio.entity.Project;
import com.coltefinanciera.itdashboard.tracking.entity.ProjectUpdate;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public final class ProjectSpecifications {

    private static final String DELETED = "deleted";
    private static final String NOT_DELETED = "N";

    private ProjectSpecifications() {
    }

    public static Specification<Project> fromFilter(ProjectFilterRequest filter) {
        return Specification.allOf(
                notDeleted(),
                pipelineStatusEquals(filter.pipelineStatus()),
                pipelineStatusIn(filter.pipelineStatuses()),
                searchContains(filter.search()),
                activeOnly(filter.activeOnly()),
                staleFilter(filter.stale()),
                requiresCoordinationFilter(filter.requiresCoordination()),
                hasStopperFilter(filter.hasStopper()),
                trafficLightEquals(filter.trafficLight())
        );
    }

    public static Specification<Project> notDeleted() {
        return (root, query, cb) -> cb.equal(root.get(DELETED), NOT_DELETED);
    }

    private static Specification<Project> pipelineStatusEquals(String pipelineStatus) {
        if (!StringUtils.hasText(pipelineStatus)) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("pipelineStatus").get("code"), pipelineStatus);
    }

    private static Specification<Project> pipelineStatusIn(List<String> pipelineStatuses) {
        if (pipelineStatuses == null || pipelineStatuses.isEmpty()) {
            return null;
        }
        return (root, query, cb) -> root.get("pipelineStatus").get("code").in(pipelineStatuses);
    }

    private static Specification<Project> searchContains(String search) {
        if (!StringUtils.hasText(search)) {
            return null;
        }
        String pattern = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), pattern);
    }

    private static Specification<Project> activeOnly(Boolean activeOnly) {
        if (activeOnly == null || !activeOnly) {
            return null;
        }
        return (root, query, cb) -> cb.notEqual(root.get("pipelineStatus").get("code"), "FINALIZADO");
    }

    private static Specification<Project> staleFilter(Boolean stale) {
        if (stale == null) {
            return null;
        }
        LocalDateTime threshold = LocalDateTime.now().minus(7, ChronoUnit.DAYS);
        return (root, query, cb) -> {
            Predicate projectStale = cb.lessThan(root.get("updatedAt"), threshold);
            Predicate projectFresh = cb.greaterThanOrEqualTo(root.get("updatedAt"), threshold);
            return stale ? projectStale : projectFresh;
        };
    }

    private static Specification<Project> requiresCoordinationFilter(Boolean requiresCoordination) {
        if (requiresCoordination == null) {
            return null;
        }
        return latestUpdateFlagEquals("requiresCoordination", requiresCoordination ? "Y" : "N");
    }

    private static Specification<Project> hasStopperFilter(Boolean hasStopper) {
        if (hasStopper == null) {
            return null;
        }
        return latestUpdateFlagEquals("hasStopper", hasStopper ? "Y" : "N");
    }

    private static Specification<Project> trafficLightEquals(String trafficLight) {
        if (!StringUtils.hasText(trafficLight)) {
            return null;
        }
        String normalized = trafficLight.trim().toUpperCase();
        return (root, query, cb) -> {
            if ("GRIS".equals(normalized)) {
                Subquery<Long> anyUpdate = query.subquery(Long.class);
                Root<ProjectUpdate> anyRoot = anyUpdate.from(ProjectUpdate.class);
                anyUpdate.select(cb.literal(1L));
                anyUpdate.where(
                        cb.equal(anyRoot.get("project"), root),
                        cb.equal(anyRoot.get(DELETED), NOT_DELETED)
                );
                Subquery<Long> latestIsGris = query.subquery(Long.class);
                Root<ProjectUpdate> updateRoot = latestIsGris.from(ProjectUpdate.class);
                latestIsGris.select(cb.literal(1L));
                latestIsGris.where(
                        cb.equal(updateRoot.get("project"), root),
                        cb.equal(updateRoot.get(DELETED), NOT_DELETED),
                        cb.equal(updateRoot.get("trafficLight").get("code"), "GRIS"),
                        cb.equal(updateRoot.get("updatedAtOriginal"), maxUpdatedAtSubquery(root, query, cb))
                );
                return cb.or(cb.not(cb.exists(anyUpdate)), cb.exists(latestIsGris));
            }
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<ProjectUpdate> updateRoot = subquery.from(ProjectUpdate.class);
            subquery.select(cb.literal(1L));
            subquery.where(
                    cb.equal(updateRoot.get("project"), root),
                    cb.equal(updateRoot.get(DELETED), NOT_DELETED),
                    cb.equal(updateRoot.get("trafficLight").get("code"), normalized),
                    cb.equal(updateRoot.get("updatedAtOriginal"), maxUpdatedAtSubquery(root, query, cb))
            );
            return cb.exists(subquery);
        };
    }

    private static Specification<Project> latestUpdateFlagEquals(String field, String value) {
        return (root, query, cb) -> {
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<ProjectUpdate> updateRoot = subquery.from(ProjectUpdate.class);
            subquery.select(cb.literal(1L));
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(updateRoot.get("project"), root));
            predicates.add(cb.equal(updateRoot.get(DELETED), NOT_DELETED));
            predicates.add(cb.equal(updateRoot.get(field), value));
            predicates.add(cb.equal(
                    updateRoot.get("updatedAtOriginal"),
                    maxUpdatedAtSubquery(root, query, cb)
            ));
            subquery.where(predicates.toArray(Predicate[]::new));
            return cb.exists(subquery);
        };
    }

    private static Subquery<LocalDateTime> maxUpdatedAtSubquery(
            Root<Project> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder cb
    ) {
        Subquery<LocalDateTime> subquery = query.subquery(LocalDateTime.class);
        Root<ProjectUpdate> updateRoot = subquery.from(ProjectUpdate.class);
        subquery.select(cb.greatest(updateRoot.<LocalDateTime>get("updatedAtOriginal")));
        subquery.where(
                cb.equal(updateRoot.get("project"), root),
                cb.equal(updateRoot.get(DELETED), NOT_DELETED)
        );
        return subquery;
    }
}
