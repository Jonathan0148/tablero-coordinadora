import { TrafficLightIndicator } from "@/shared/components/data/traffic-light-indicator";

export function TrafficLightBadge({ code }: { code?: string }) {
  return <TrafficLightIndicator code={code} size="md" />;
}
