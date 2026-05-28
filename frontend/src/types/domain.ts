export type UserProfile = {
  userId: number;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];
};

export type AdminRoleSummary = {
  id: number;
  code: string;
  name: string;
  active: boolean;
};

export type AdminRole = {
  id: number;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  permissionCodes: string[];
};

export type AdminPermission = {
  id: number;
  code: string;
  module: string;
  action: string;
  description?: string;
  active: boolean;
};

export type AdminPermissionGroup = {
  module: string;
  label: string;
  permissions: AdminPermission[];
};

export type AdminUser = {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  active: boolean;
  roles: AdminRoleSummary[];
  effectivePermissions: string[];
  lastLoginAt?: string;
};

export type AuthPayload = {
  accessToken: string;
  tokenType: "Bearer" | string;
  expiresInMinutes: number;
  user: UserProfile;
};

export type DashboardSummary = {
  totalProjects: number;
  activeKanbanCards: number;
  activityLogs: number;
  projectsByTrafficLight: Record<string, number>;
};

export type DashboardMilestoneItem = {
  projectId: number;
  projectName: string;
  milestone: string;
  milestoneDate: string;
};

export type DashboardStaleProjectItem = {
  projectId: number;
  projectName: string;
  staleDays: number;
};

export type DashboardActivityLogItem = {
  id: number;
  text: string;
  areaCode: string;
  loggedAt: string;
};

export type DashboardCoordinationProjectItem = {
  projectId: number;
  projectName: string;
  coordinationDesc?: string;
  responsibleAreaName?: string;
  responsibleAction?: string;
};

export type ExecutiveDashboard = {
  totalProjects: number;
  trafficLightCounts: Record<string, number>;
  stopperCount: number;
  staleCount: number;
  coordinationCount: number;
  executiveStatusBreakdown: Record<string, number>;
  upcomingMilestones: DashboardMilestoneItem[];
  staleProjects: DashboardStaleProjectItem[];
  recentActivityLogs: DashboardActivityLogItem[];
  coordinationProjects: DashboardCoordinationProjectItem[];
};

export type AlertItem = {
  type: string;
  text: string;
  tag: string;
  scope: "project" | "kanban" | string;
  projectId?: number;
  kanbanCardId?: number;
};

export type CommitteeSummary = {
  portfolioStats: {
    totalProjects: number;
    redCount: number;
    amberCount: number;
    greenCount: number;
    stopperCount: number;
    staleCount: number;
    coordinationCount: number;
  };
  immediateAttention: { projects: CommitteeProjectItem[] };
  followUp: { projects: CommitteeProjectItem[] };
  resourceLoad: {
    activeMemberCount: number;
    totalAssignments: number;
    topMembers: { memberId: number; memberName: string; assignmentCount: number }[];
  };
  milestones30Days: {
    milestones: { projectId: number; projectName: string; milestone: string; milestoneDate: string }[];
  };
};

export type CommitteeProjectItem = {
  projectId: number;
  projectName: string;
  trafficLightCode: string;
  executiveStatusCode?: string;
  executiveStatusName?: string;
  requiresCoordination: boolean;
  coordinationDesc?: string;
  responsibleAreaName?: string;
  responsibleAction?: string;
  hasStopper: boolean;
  stopperImpactName?: string;
  stopperDesc?: string;
  leadName?: string;
  nextMilestone?: string;
  nextMilestoneDate?: string;
  staleDays?: number;
  pendingDecisions?: string;
};

export type Project = {
  id: number;
  legacyId?: string;
  name: string;
  pipelineStatusCode: string;
  pipelineStatusName: string;
  startDate?: string;
  legacyUpdatedAt?: string;
  currentTrafficLight?: string;
  currentExecutiveStatus?: string;
  leadName?: string;
  assignmentCount?: number;
  openTaskCount?: number;
  staleDays?: number | null;
  requiresCoordination?: boolean;
  hasStopper?: boolean;
  stopperImpactCode?: string;
  summaryPreview?: string;
};

export type ProjectFilters = {
  pipelineStatus?: string;
  pipelineStatuses?: string[];
  trafficLight?: string;
  search?: string;
  stale?: boolean;
  requiresCoordination?: boolean;
  hasStopper?: boolean;
  activeOnly?: boolean;
};

export type ProjectUpdate = {
  id: number;
  legacyId?: string;
  projectId: number;
  updatedAtOriginal: string;
  executiveStatusCode: string;
  executiveStatusName: string;
  trafficLightCode: string;
  trafficLightName: string;
  summary: string;
  pendingItems?: string;
  hasStopper: boolean;
  stopperDesc?: string;
  stopperOwner?: string;
  stopperImpactCode?: string;
  relevantRisks?: string;
  nextMilestone?: string;
  nextMilestoneDate?: string;
  pendingDecisions?: string;
  requiresCoordination: boolean;
  coordinationDesc?: string;
  responsibleAreaCode?: string;
  responsibleAction?: string;
  additionalNotes?: string;
};

export type CreateProjectUpdatePayload = {
  executiveStatusCode: string;
  summary: string;
  pendingItems?: string;
  hasStopper: boolean;
  stopperDesc?: string;
  stopperOwner?: string;
  stopperImpactCode?: string;
  relevantRisks?: string;
  nextMilestone?: string;
  nextMilestoneDate?: string;
  pendingDecisions?: string;
  requiresCoordination: boolean;
  coordinationDesc?: string;
  responsibleAreaCode?: string;
  responsibleAction?: string;
  additionalNotes?: string;
  calculateTrafficLight: boolean;
};

export type ProjectAssignment = {
  id: number;
  legacyId?: string;
  projectId: number;
  projectName: string;
  teamMemberId: number;
  teamMemberName: string;
  roleCode: string;
  roleName: string;
  lead: boolean;
};

export type TeamMember = {
  id: number;
  legacyId?: string;
  name: string;
  defaultRoleCode?: string;
  defaultRoleName?: string;
  email?: string;
  active: boolean;
  notes?: string;
};

export type KanbanCard = {
  id: number;
  legacyId?: string;
  text: string;
  areaCode: string;
  priorityCode: string;
  statusCode: string;
  dueDate?: string;
  reminderAt?: string;
  projectId?: number;
};

export type ActivityLog = {
  id: number;
  legacyId?: string;
  text: string;
  areaCode: string;
  loggedAtOriginal: string;
};

export type Okr = {
  id: number;
  legacyId?: string;
  name: string;
  activities: OkrActivity[];
};

export type OkrActivity = {
  id: number;
  legacyId?: string;
  pct: number;
  statusCode: string;
  text: string;
  responsible?: string;
  dependency?: string;
  deliverable?: string;
};
