import { Badge } from "@/shared/components/badge";
import { trafficLightTone } from "@/shared/utils/traffic-light";
import { TRAFFIC_LIGHT_LABELS } from "@/shared/utils/constants";

export function TrafficLightBadge({ code }: { code?: string }) {
  return <Badge tone={trafficLightTone(code)}>{TRAFFIC_LIGHT_LABELS[code ?? "GRIS"] ?? "Sin datos"}</Badge>;
}
