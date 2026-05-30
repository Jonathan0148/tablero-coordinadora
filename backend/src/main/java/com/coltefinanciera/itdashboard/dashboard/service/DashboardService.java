package com.coltefinanciera.itdashboard.dashboard.service;

import com.coltefinanciera.itdashboard.dashboard.dto.*;
import com.coltefinanciera.itdashboard.logbook.repository.ActivityLogRepository;
import com.coltefinanciera.itdashboard.portfolio.entity.Project;
import com.coltefinanciera.itdashboard.portfolio.repository.ProjectRepository;
import com.coltefinanciera.itdashboard.portfolio.service.ProjectEnrichmentService;
import com.coltefinanciera.itdashboard.team.entity.TeamMember;
import com.coltefinanciera.itdashboard.team.repository.ProjectAssignmentRepository;
import com.coltefinanciera.itdashboard.team.repository.TeamMemberRepository;
import com.coltefinanciera.itdashboard.tracking.entity.ProjectUpdate;
import com.coltefinanciera.itdashboard.work.entity.KanbanCard;
import com.coltefinanciera.itdashboard.work.repository.KanbanCardRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final Set<String> HIGH_STOPPER_IMPACTS = Set.of("ALTO", "CRITICO");
    private static final List<String> TRAFFIC_LIGHT_ORDER = List.of("ROJO", "AMARILLO", "VERDE", "GRIS");
    private static final List<String> EXECUTIVE_STATUS_ORDER = List.of(
            "EN_CURSO", "EN_RIESGO", "BLOQUEADO", "REQUIERE_DECISION", "COMPLETADO"
    );

    private final ProjectRepository projectRepository;
    private final ProjectEnrichmentService enrichmentService;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ActivityLogRepository activityLogRepository;
    private final KanbanCardRepository kanbanCardRepository;

    public DashboardService(
            ProjectRepository projectRepository,
            ProjectEnrichmentService enrichmentService,
            ProjectAssignmentRepository projectAssignmentRepository,
            TeamMemberRepository teamMemberRepository,
            ActivityLogRepository activityLogRepository,
            KanbanCardRepository kanbanCardRepository
    ) {
        this.projectRepository = projectRepository;
        this.enrichmentService = enrichmentService;
        this.projectAssignmentRepository = projectAssignmentRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.activityLogRepository = activityLogRepository;
        this.kanbanCardRepository = kanbanCardRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_reports:read') or hasAuthority('PERM_committee:read')")
    public DashboardSummaryResponse summary() {
        List<ProjectContext> contexts = loadProjectContexts();
        Map<String, Long> byTrafficLight = new LinkedHashMap<>();
        TRAFFIC_LIGHT_ORDER.forEach(code -> byTrafficLight.put(code, 0L));
        contexts.forEach(ctx -> byTrafficLight.merge(ctx.trafficLightCode(), 1L, Long::sum));
        long cards = kanbanCardRepository.findByDeleted("N").stream()
                .filter(card -> !"HECHO".equals(card.getKanbanStatus().getCode()))
                .count();
        long logs = activityLogRepository.findByDeleted("N", PageRequest.of(0, 1)).getTotalElements();
        return new DashboardSummaryResponse(contexts.size(), cards, logs, byTrafficLight);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_reports:read')")
    public ExecutiveDashboardResponse executiveDashboard() {
        List<ProjectContext> contexts = loadProjectContexts();
        Map<String, Long> trafficLightCounts = initTrafficLightCounts();
        Map<String, Long> executiveStatusBreakdown = initExecutiveStatusBreakdown();
        long stopperCount = 0;
        long staleCount = 0;
        long coordinationCount = 0;
        List<DashboardCoordinationProjectItem> coordinationProjects = new ArrayList<>();
        List<DashboardMilestoneItem> milestones = new ArrayList<>();
        List<DashboardStaleProjectItem> staleProjects = new ArrayList<>();

        LocalDate today = LocalDate.now();
        for (ProjectContext ctx : contexts) {
            trafficLightCounts.merge(ctx.trafficLightCode(), 1L, Long::sum);
            ProjectUpdate update = ctx.latestUpdate();
            if (update != null) {
                if ("Y".equals(update.getHasStopper())) {
                    stopperCount++;
                }
                executiveStatusBreakdown.merge(update.getExecutiveStatus().getCode(), 1L, Long::sum);
                if ("Y".equals(update.getRequiresCoordination())) {
                    coordinationCount++;
                    coordinationProjects.add(new DashboardCoordinationProjectItem(
                            ctx.project().getId(),
                            ctx.project().getName(),
                            update.getCoordinationDesc(),
                            update.getResponsibleArea() == null ? null : update.getResponsibleArea().getName(),
                            update.getResponsibleAction()
                    ));
                }
                if (update.getNextMilestoneDate() != null) {
                    milestones.add(new DashboardMilestoneItem(
                            ctx.project().getId(),
                            ctx.project().getName(),
                            update.getNextMilestone(),
                            update.getNextMilestoneDate()
                    ));
                }
            }
            if (ctx.staleDays() != null && ctx.staleDays() > 7) {
                staleCount++;
                staleProjects.add(new DashboardStaleProjectItem(
                        ctx.project().getId(),
                        ctx.project().getName(),
                        ctx.staleDays()
                ));
            }
        }

        List<DashboardMilestoneItem> upcomingMilestones = milestones.stream()
                .filter(item -> item.milestoneDate() != null && !item.milestoneDate().isBefore(today))
                .sorted(Comparator.comparing(DashboardMilestoneItem::milestoneDate))
                .limit(5)
                .toList();

        List<DashboardStaleProjectItem> topStaleProjects = staleProjects.stream()
                .sorted(Comparator.comparing(DashboardStaleProjectItem::staleDays).reversed())
                .limit(5)
                .toList();

        List<DashboardActivityLogItem> recentActivityLogs = activityLogRepository
                .findByDeleted("N", PageRequest.of(0, 5))
                .map(log -> new DashboardActivityLogItem(
                        log.getId(),
                        log.getText(),
                        log.getWorkArea().getCode(),
                        log.getLoggedAtOriginal()
                ))
                .getContent();

        return new ExecutiveDashboardResponse(
                contexts.size(),
                trafficLightCounts,
                stopperCount,
                staleCount,
                coordinationCount,
                executiveStatusBreakdown,
                upcomingMilestones,
                topStaleProjects,
                recentActivityLogs,
                coordinationProjects
        );
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_committee:read')")
    public CommitteeSummaryResponse committeeSummary() {
        List<ProjectContext> contexts = loadProjectContexts();
        long redCount = 0;
        long amberCount = 0;
        long greenCount = 0;
        long stopperCount = 0;
        long staleCount = 0;
        long coordinationCount = 0;

        for (ProjectContext ctx : contexts) {
            switch (ctx.trafficLightCode()) {
                case "ROJO" -> redCount++;
                case "AMARILLO" -> amberCount++;
                case "VERDE" -> greenCount++;
                default -> {
                }
            }
            ProjectUpdate update = ctx.latestUpdate();
            if (update != null) {
                if ("Y".equals(update.getHasStopper())) {
                    stopperCount++;
                }
                if ("Y".equals(update.getRequiresCoordination())) {
                    coordinationCount++;
                }
            }
            if (ctx.staleDays() != null && ctx.staleDays() > 7) {
                staleCount++;
            }
        }

        CommitteeSummaryResponse.PortfolioStats portfolioStats = new CommitteeSummaryResponse.PortfolioStats(
                contexts.size(),
                redCount,
                amberCount,
                greenCount,
                stopperCount,
                staleCount,
                coordinationCount
        );

        List<CommitteeSummaryResponse.CommitteeProjectItem> immediateAttention = contexts.stream()
                .filter(ctx -> "ROJO".equals(ctx.trafficLightCode())
                        || (ctx.latestUpdate() != null && "Y".equals(ctx.latestUpdate().getRequiresCoordination())))
                .sorted(Comparator.comparingInt(ctx -> ctx.latestUpdate() != null
                        && "Y".equals(ctx.latestUpdate().getRequiresCoordination()) ? 0 : 1))
                .map(this::toCommitteeProjectItem)
                .toList();

        LocalDate today = LocalDate.now();
        LocalDate followUpCutoff = today.plusDays(14);
        LocalDate milestoneCutoff = today.plusDays(30);

        LinkedHashMap<Long, ProjectContext> followUpMap = new LinkedHashMap<>();
        for (ProjectContext ctx : contexts) {
            ProjectUpdate update = ctx.latestUpdate();
            boolean include = "AMARILLO".equals(ctx.trafficLightCode())
                    || (ctx.staleDays() != null && ctx.staleDays() > 7)
                    || (update != null
                    && update.getNextMilestoneDate() != null
                    && !update.getNextMilestoneDate().isBefore(today)
                    && !update.getNextMilestoneDate().isAfter(followUpCutoff));
            if (include) {
                followUpMap.putIfAbsent(ctx.project().getId(), ctx);
            }
        }

        List<CommitteeSummaryResponse.CommitteeProjectItem> followUp = followUpMap.values().stream()
                .limit(8)
                .map(this::toCommitteeProjectItem)
                .toList();

        Map<Long, TeamMember> membersById = teamMemberRepository.findByDeleted("N", PageRequest.of(0, 1000))
                .stream()
                .collect(Collectors.toMap(TeamMember::getId, member -> member));
        List<CommitteeSummaryResponse.ResourceLoadItem> topMembers = projectAssignmentRepository.countActiveMemberAssignments()
                .stream()
                .map(row -> {
                    Long memberId = (Long) row[0];
                    int count = ((Long) row[1]).intValue();
                    TeamMember member = membersById.get(memberId);
                    return new CommitteeSummaryResponse.ResourceLoadItem(
                            memberId,
                            member == null ? "Desconocido" : member.getName(),
                            count
                    );
                })
                .sorted(Comparator.comparingInt(CommitteeSummaryResponse.ResourceLoadItem::assignmentCount).reversed())
                .limit(10)
                .toList();

        int totalAssignments = projectAssignmentRepository.findByDeleted("N").size();
        int activeMemberCount = (int) membersById.values().stream().filter(member -> "Y".equals(member.getActive())).count();

        List<CommitteeSummaryResponse.CommitteeMilestoneItem> milestones30Days = contexts.stream()
                .filter(ctx -> ctx.latestUpdate() != null
                        && ctx.latestUpdate().getNextMilestoneDate() != null
                        && !ctx.latestUpdate().getNextMilestoneDate().isBefore(today)
                        && !ctx.latestUpdate().getNextMilestoneDate().isAfter(milestoneCutoff))
                .sorted(Comparator.comparing(ctx -> ctx.latestUpdate().getNextMilestoneDate()))
                .map(ctx -> new CommitteeSummaryResponse.CommitteeMilestoneItem(
                        ctx.project().getId(),
                        ctx.project().getName(),
                        ctx.latestUpdate().getNextMilestone(),
                        ctx.latestUpdate().getNextMilestoneDate()
                ))
                .toList();

        return new CommitteeSummaryResponse(
                portfolioStats,
                new CommitteeSummaryResponse.ImmediateAttention(immediateAttention),
                new CommitteeSummaryResponse.FollowUp(followUp),
                new CommitteeSummaryResponse.ResourceLoad(activeMemberCount, totalAssignments, topMembers),
                new CommitteeSummaryResponse.Milestones30Days(milestones30Days)
        );
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_reports:read')")
    public List<AlertItemResponse> computeAlerts() {
        List<AlertItemResponse> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (KanbanCard card : kanbanCardRepository.findByDeleted("N")) {
            if ("HECHO".equals(card.getKanbanStatus().getCode())) {
                continue;
            }
            if (card.getDueDate() != null) {
                if (card.getDueDate().isBefore(today)) {
                    alerts.add(new AlertItemResponse(
                            "overdue",
                            card.getText(),
                            "⚠️ Vencida",
                            "kanban",
                            card.getProject() == null ? null : card.getProject().getId(),
                            card.getId()
                    ));
                } else if (card.getDueDate().isEqual(today)) {
                    alerts.add(new AlertItemResponse(
                            "today",
                            card.getText(),
                            "📅 Hoy",
                            "kanban",
                            card.getProject() == null ? null : card.getProject().getId(),
                            card.getId()
                    ));
                }
            }
            if (card.getReminderAt() != null && !card.getReminderAt().isAfter(java.time.LocalDateTime.now())) {
                alerts.add(new AlertItemResponse(
                        "reminder",
                        card.getText(),
                        "🔔 Recordatorio",
                        "kanban",
                        card.getProject() == null ? null : card.getProject().getId(),
                        card.getId()
                ));
            }
        }

        for (ProjectContext ctx : loadProjectContexts()) {
            Project project = ctx.project();
            ProjectUpdate update = ctx.latestUpdate();
            if (update != null && "Y".equals(update.getRequiresCoordination())) {
                alerts.add(new AlertItemResponse(
                        "coord",
                        project.getName() + ": " + (StringUtils.hasText(update.getCoordinationDesc())
                                ? update.getCoordinationDesc()
                                : ""),
                        "🚨 Coordinación",
                        "project",
                        project.getId(),
                        null
                ));
            }
            if (update != null && "BLOQUEADO".equals(update.getExecutiveStatus().getCode())) {
                alerts.add(new AlertItemResponse(
                        "blocked",
                        project.getName() + ": proyecto bloqueado",
                        "🔴 Bloqueado",
                        "project",
                        project.getId(),
                        null
                ));
            }
            if (update != null
                    && "Y".equals(update.getHasStopper())
                    && update.getStopperImpact() != null
                    && HIGH_STOPPER_IMPACTS.contains(update.getStopperImpact().getCode())) {
                String desc = update.getStopperDesc();
                String suffix = StringUtils.hasText(desc)
                        ? " — " + (desc.length() > 60 ? desc.substring(0, 60) : desc)
                        : "";
                alerts.add(new AlertItemResponse(
                        "stopper",
                        project.getName() + ": stopper " + update.getStopperImpact().getName() + suffix,
                        "🛑 Stopper " + update.getStopperImpact().getName(),
                        "project",
                        project.getId(),
                        null
                ));
            }
            if (update != null
                    && update.getNextMilestoneDate() != null
                    && update.getNextMilestoneDate().isBefore(today)) {
                alerts.add(new AlertItemResponse(
                        "milestone",
                        project.getName() + ": hito vencido — "
                                + (StringUtils.hasText(update.getNextMilestone())
                                ? update.getNextMilestone()
                                : update.getNextMilestoneDate()),
                        "📅 Hito vencido",
                        "project",
                        project.getId(),
                        null
                ));
            }
            if (ctx.staleDays() != null && ctx.staleDays() > 7 && update == null) {
                alerts.add(new AlertItemResponse(
                        "stale",
                        project.getName() + ": sin actualizaciones (" + ctx.staleDays() + " días)",
                        "⏳ Sin actualizar",
                        "project",
                        project.getId(),
                        null
                ));
            }
        }
        return alerts;
    }

    private CommitteeSummaryResponse.CommitteeProjectItem toCommitteeProjectItem(ProjectContext ctx) {
        Project project = ctx.project();
        ProjectUpdate update = ctx.latestUpdate();
        return new CommitteeSummaryResponse.CommitteeProjectItem(
                project.getId(),
                project.getName(),
                ctx.trafficLightCode(),
                update == null ? null : update.getExecutiveStatus().getCode(),
                update == null ? null : update.getExecutiveStatus().getName(),
                update != null && "Y".equals(update.getRequiresCoordination()),
                update == null ? null : update.getCoordinationDesc(),
                update == null || update.getResponsibleArea() == null ? null : update.getResponsibleArea().getName(),
                update == null ? null : update.getResponsibleAction(),
                update != null && "Y".equals(update.getHasStopper()),
                update == null || update.getStopperImpact() == null ? null : update.getStopperImpact().getName(),
                update == null ? null : update.getStopperDesc(),
                ctx.leadName(),
                update == null ? null : update.getNextMilestone(),
                update == null ? null : update.getNextMilestoneDate(),
                ctx.staleDays(),
                update == null ? null : update.getPendingDecisions()
        );
    }

    private List<ProjectContext> loadProjectContexts() {
        List<Project> projects = projectRepository.findByDeleted("N");
        Map<Long, ProjectUpdate> latestUpdates = enrichmentService.loadLatestUpdates(projects);
        Map<Long, String> leadNames = enrichmentService.loadLeadNames(projects);
        return projects.stream()
                .map(project -> {
                    ProjectUpdate latestUpdate = latestUpdates.get(project.getId());
                    Integer staleDays = enrichmentService.computeStaleDays(project, latestUpdate);
                    String trafficLightCode = latestUpdate == null ? "GRIS" : latestUpdate.getTrafficLight().getCode();
                    return new ProjectContext(project, latestUpdate, leadNames.get(project.getId()), staleDays, trafficLightCode);
                })
                .toList();
    }

    private Map<String, Long> initExecutiveStatusBreakdown() {
        Map<String, Long> counts = new LinkedHashMap<>();
        EXECUTIVE_STATUS_ORDER.forEach(code -> counts.put(code, 0L));
        return counts;
    }

    private Map<String, Long> initTrafficLightCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        TRAFFIC_LIGHT_ORDER.forEach(code -> counts.put(code, 0L));
        return counts;
    }

    private record ProjectContext(
            Project project,
            ProjectUpdate latestUpdate,
            String leadName,
            Integer staleDays,
            String trafficLightCode
    ) {
    }
}
