export const PIPELINE_STATUSES = [
  { code: "DESARROLLO", label: "Desarrollo" },
  { code: "PLANEACION", label: "Planeación" },
  { code: "REVISION", label: "Revisión" },
  { code: "RECEPCION_HUS", label: "Recepción Hus" },
  { code: "CERTIFICACION", label: "Certificación" },
  { code: "PAUSADO", label: "Pausado" },
  { code: "FINALIZADO", label: "Finalizado" },
];

export const EXECUTIVE_STATUSES = [
  { code: "EN_CURSO", label: "En curso" },
  { code: "EN_RIESGO", label: "En riesgo" },
  { code: "BLOQUEADO", label: "Bloqueado" },
  { code: "REQUIERE_DECISION", label: "Requiere decisión" },
  { code: "COMPLETADO", label: "Completado" },
];

export const STOPPER_IMPACTS = [
  { code: "BAJO", label: "Bajo" },
  { code: "MEDIO", label: "Medio" },
  { code: "ALTO", label: "Alto" },
  { code: "CRITICO", label: "Crítico" },
];

export const RESPONSIBLE_AREAS = [
  { code: "COORDINACION", label: "Coordinacion" },
  { code: "DIRECCION", label: "Direccion" },
  { code: "GERENCIA", label: "Gerencia" },
  { code: "DELIVERY_MANAGER", label: "Delivery Manager" },
  { code: "PRODUCT_DELIVERY", label: "Product Delivery" },
  { code: "FUNCIONAL", label: "Funcional" },
];

export const KANBAN_STATUSES = [
  { code: "PENDIENTE", label: "Pendiente" },
  { code: "EN_CURSO", label: "En curso" },
  { code: "HECHO", label: "Hecho" },
];

export const KANBAN_PRIORITIES = [
  { code: "ALTA", label: "Alta" },
  { code: "MEDIA", label: "Media" },
  { code: "BAJA", label: "Baja" },
];

export const KANBAN_AREAS = [
  { code: "PLAN", label: "Planificación" },
  { code: "EXEC", label: "Ejecución" },
  { code: "STAKE", label: "Stakeholders" },
  { code: "TRANS", label: "Transversal" },
  { code: "CIERRE", label: "Cierre" },
  { code: "COTIDIANA", label: "Cotidiana" },
  { code: "SEGUIMIENTO", label: "Seguimiento" },
];

export const LOG_AREAS = KANBAN_AREAS;

export const DEFAULT_VISIBLE_PIPELINE = PIPELINE_STATUSES.filter((s) => s.code !== "FINALIZADO").map((s) => s.code);

export const TRAFFIC_LIGHT_LABELS: Record<string, string> = {
  VERDE: "Verde",
  AMARILLO: "Amarillo",
  ROJO: "Rojo",
  GRIS: "Sin datos",
};
