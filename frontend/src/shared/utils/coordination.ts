import type { CommitteeProjectItem, DashboardCoordinationProjectItem } from "@/types/domain";
import type { CoordinationProjectItem } from "@/shared/components/layout/coordination-panel";

export function toCoordinationItems(
  projects: Array<
    Pick<
      CommitteeProjectItem | DashboardCoordinationProjectItem,
      "projectId" | "projectName" | "coordinationDesc" | "responsibleAreaName" | "responsibleAction"
    > & { requiresCoordination?: boolean }
  >,
): CoordinationProjectItem[] {
  const seen = new Set<number>();
  const items: CoordinationProjectItem[] = [];

  for (const p of projects) {
    if ("requiresCoordination" in p && p.requiresCoordination === false) continue;
    if (seen.has(p.projectId)) continue;
    seen.add(p.projectId);
    items.push({
      projectId: p.projectId,
      projectName: p.projectName,
      coordinationDesc: p.coordinationDesc,
      responsibleAreaName: p.responsibleAreaName,
      responsibleAction: p.responsibleAction,
    });
  }

  return items;
}

export function collectCoordinationFromCommittee(
  immediate: CommitteeProjectItem[],
  followUp: CommitteeProjectItem[],
): CoordinationProjectItem[] {
  return toCoordinationItems([
    ...immediate.filter((p) => p.requiresCoordination),
    ...followUp.filter((p) => p.requiresCoordination),
  ]);
}
