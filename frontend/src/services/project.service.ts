import { apiClient, unwrap } from "@/services/api-client";
import type {
  AlertItem,
  CommitteeSummary,
  CreateProjectUpdatePayload,
  DashboardSummary,
  ExecutiveDashboard,
  Project,
  ProjectAssignment,
  ProjectFilters,
  ProjectUpdate,
} from "@/types/domain";
import type { PageResponse } from "@/shared/types/api";

function buildProjectParams(filters: ProjectFilters, page: number, size: number) {
  const params: Record<string, unknown> = { page, size, sort: "id,asc" };
  if (filters.pipelineStatus) params.pipelineStatus = filters.pipelineStatus;
  if (filters.pipelineStatuses?.length) params.pipelineStatuses = filters.pipelineStatuses;
  if (filters.trafficLight) params.trafficLight = filters.trafficLight;
  if (filters.search) params.search = filters.search;
  if (filters.stale) params.stale = true;
  if (filters.requiresCoordination) params.requiresCoordination = true;
  if (filters.hasStopper) params.hasStopper = true;
  if (filters.activeOnly) params.activeOnly = true;
  return params;
}

export const dashboardService = {
  summary() {
    return unwrap<DashboardSummary>(apiClient.get("/v1/dashboard/summary"));
  },
  executive() {
    return unwrap<ExecutiveDashboard>(apiClient.get("/v1/dashboard/executive"));
  },
  alerts() {
    return unwrap<AlertItem[]>(apiClient.get("/v1/dashboard/alerts"));
  },
  committee() {
    return unwrap<CommitteeSummary>(apiClient.get("/v1/committee/summary"));
  },
};

export const projectService = {
  list(page = 0, size = 20, filters: ProjectFilters = {}) {
    return unwrap<PageResponse<Project>>(
      apiClient.get("/v1/projects", { params: buildProjectParams(filters, page, size) }),
    );
  },
  get(id: number) {
    return unwrap<Project>(apiClient.get(`/v1/projects/${id}`));
  },
  create(payload: { name: string; pipelineStatusCode: string; startDate?: string }) {
    return unwrap<Project>(apiClient.post("/v1/projects", payload));
  },
  update(id: number, payload: { name: string; pipelineStatusCode: string; startDate?: string }) {
    return unwrap<Project>(apiClient.put(`/v1/projects/${id}`, payload));
  },
  remove(id: number) {
    return apiClient.delete(`/v1/projects/${id}`);
  },
  updates(projectId: number, page = 0, size = 50) {
    return unwrap<PageResponse<ProjectUpdate>>(
      apiClient.get(`/v1/projects/${projectId}/updates`, {
        params: { page, size, sort: "updatedAtOriginal,desc" },
      }),
    );
  },
  currentStatus(projectId: number) {
    return unwrap<ProjectUpdate>(apiClient.get(`/v1/projects/${projectId}/current-status`));
  },
  createUpdate(projectId: number, payload: CreateProjectUpdatePayload) {
    return unwrap<ProjectUpdate>(apiClient.post(`/v1/projects/${projectId}/updates`, payload));
  },
  assignments(projectId: number) {
    return unwrap<ProjectAssignment[]>(apiClient.get(`/v1/projects/${projectId}/assignments`));
  },
};

export const assignmentService = {
  create(payload: { projectId: number; teamMemberId: number; roleCode: string; lead: boolean }) {
    return unwrap<ProjectAssignment>(apiClient.post("/v1/assignments", payload));
  },
  remove(id: number) {
    return apiClient.delete(`/v1/assignments/${id}`);
  },
};

export const teamService = {
  list(page = 0, size = 100) {
    return unwrap<PageResponse<import("@/types/domain").TeamMember>>(
      apiClient.get("/v1/team-members", { params: { page, size } }),
    );
  },
  create(payload: { name: string; roleCode?: string; defaultRoleCode?: string; email?: string; active: boolean; notes?: string }) {
    return unwrap<import("@/types/domain").TeamMember>(apiClient.post("/v1/team-members", {
      name: payload.name,
      roleCode: payload.roleCode ?? payload.defaultRoleCode,
      email: payload.email,
      active: payload.active,
      notes: payload.notes,
    }));
  },
  update(id: number, payload: { name: string; defaultRoleCode: string; email?: string; active: boolean; notes?: string }) {
    return unwrap<import("@/types/domain").TeamMember>(apiClient.put(`/v1/team-members/${id}`, payload));
  },
  remove(id: number) {
    return apiClient.delete(`/v1/team-members/${id}`);
  },
};

export const kanbanService = {
  list(page = 0, size = 200) {
    return unwrap<PageResponse<import("@/types/domain").KanbanCard>>(
      apiClient.get("/v1/kanban/cards", { params: { page, size } }),
    );
  },
  create(payload: {
    text: string;
    areaCode: string;
    priorityCode: string;
    statusCode: string;
    dueDate?: string;
    reminderAt?: string;
    projectId?: number;
  }) {
    return unwrap<import("@/types/domain").KanbanCard>(apiClient.post("/v1/kanban/cards", payload));
  },
  update(id: number, payload: {
    text: string;
    areaCode: string;
    priorityCode: string;
    statusCode: string;
    dueDate?: string;
    reminderAt?: string;
    projectId?: number;
  }) {
    return unwrap<import("@/types/domain").KanbanCard>(apiClient.put(`/v1/kanban/cards/${id}`, payload));
  },
  updateStatus(id: number, statusCode: string) {
    return unwrap<import("@/types/domain").KanbanCard>(
      apiClient.patch(`/v1/kanban/cards/${id}/status`, null, { params: { statusCode } }),
    );
  },
  remove(id: number) {
    return apiClient.delete(`/v1/kanban/cards/${id}`);
  },
};

export const logService = {
  list(page = 0, size = 100, area?: string) {
    return unwrap<PageResponse<import("@/types/domain").ActivityLog>>(
      apiClient.get("/v1/activity-logs", { params: { page, size, area } }),
    );
  },
  create(payload: { text: string; areaCode: string }) {
    return unwrap<import("@/types/domain").ActivityLog>(apiClient.post("/v1/activity-logs", payload));
  },
  remove(id: number) {
    return apiClient.delete(`/v1/activity-logs/${id}`);
  },
};

export const okrService = {
  list() {
    return unwrap<import("@/types/domain").Okr[]>(apiClient.get("/v1/okrs"));
  },
  updateActivity(okrId: number, activityId: number, payload: { pct?: number; statusCode?: string }) {
    return unwrap<import("@/types/domain").OkrActivity>(
      apiClient.patch(`/v1/okrs/${okrId}/activities/${activityId}`, payload),
    );
  },
};
