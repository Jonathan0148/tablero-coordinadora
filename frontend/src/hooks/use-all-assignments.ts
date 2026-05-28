"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import type { Project, ProjectAssignment } from "@/types/domain";

export type ProjectAssignmentRow = {
  project: Project;
  assignments: ProjectAssignment[];
  lead?: ProjectAssignment;
  members: ProjectAssignment[];
};

export function useAllAssignments() {
  const projects = useQuery({
    queryKey: ["projects-all-assignments"],
    queryFn: () => projectService.list(0, 100, { activeOnly: false }),
  });

  const projectIds = projects.data?.content.map((p) => p.id) ?? [];

  const assignmentQueries = useQueries({
    queries: projectIds.map((id) => ({
      queryKey: ["project-assignments", id],
      queryFn: () => projectService.assignments(id),
      enabled: projectIds.length > 0,
    })),
  });

  const isLoading = projects.isLoading || assignmentQueries.some((q) => q.isLoading);
  const isError = projects.isError || assignmentQueries.some((q) => q.isError);

  const rows = (projects.data?.content ?? [])
    .flatMap((project, index) => {
      const assignments = assignmentQueries[index]?.data ?? [];
      if (!assignments.length) return [];
      const lead = assignments.find((a) => a.lead);
      const members = assignments.filter((a) => !a.lead);
      return [{ project, assignments, lead, members }];
    }) satisfies ProjectAssignmentRow[];

  return { rows, isLoading, isError, projects: projects.data?.content ?? [] };
}
