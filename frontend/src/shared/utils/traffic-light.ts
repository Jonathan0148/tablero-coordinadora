type TrafficLightInput = {
  requiresCoordination: boolean;
  executiveStatusCode: string;
  hasStopper: boolean;
  stopperImpactCode?: string;
  relevantRisks?: string;
};

export function calcTrafficLight(input: TrafficLightInput): string {
  if (input.requiresCoordination) return "ROJO";
  if (input.executiveStatusCode === "BLOQUEADO") return "ROJO";
  if (input.hasStopper && ["ALTO", "CRITICO"].includes(input.stopperImpactCode ?? "")) return "ROJO";
  if (["EN_RIESGO", "REQUIERE_DECISION"].includes(input.executiveStatusCode)) return "AMARILLO";
  if (input.hasStopper && ["BAJO", "MEDIO"].includes(input.stopperImpactCode ?? "")) return "AMARILLO";
  if (input.relevantRisks?.trim() && input.executiveStatusCode === "EN_CURSO") return "AMARILLO";
  if (["EN_CURSO", "COMPLETADO"].includes(input.executiveStatusCode)) return "VERDE";
  return "GRIS";
}

export function trafficLightTone(code?: string): "green" | "yellow" | "red" | "slate" {
  switch (code) {
    case "VERDE":
      return "green";
    case "AMARILLO":
      return "yellow";
    case "ROJO":
      return "red";
    default:
      return "slate";
  }
}
