# FASE 6.6 — Frontend UX/UI Hardening

**Fecha:** 2026-05-28  
**Alcance:** Solo frontend Next.js (sin cambios backend)  
**Fuentes legacy:** `tablero_coordinadora_it_v3_3_3.html`, `tablero_IT_respaldo_2026-05-19.json`

---

## 1. Objetivo

Pulir la experiencia operativa del dashboard IT hasta alcanzar **paridad funcional equivalente o superior** al HTML legacy, con UX/UI enterprise moderna (Linear / Notion / Jira), sin copiar el diseño visual legacy.

---

## 2. Sistema UI compartido (nuevo)

| Componente | Ruta | Propósito |
|------------|------|-----------|
| `PageHeader` | `shared/components/layout/page-header.tsx` | Encabezado con eyebrow, título, subtítulo y acciones primarias |
| `KpiStrip` | `shared/components/layout/kpi-strip.tsx` | 4 KPIs legacy con barras proporcionales |
| `FilterToolbar` | `shared/components/layout/filter-toolbar.tsx` | Toolbar sticky: búsqueda, chips, filtros avanzados, contador activos |
| `AlertsPanel` | `shared/components/layout/alerts-panel.tsx` | Alertas agrupadas por categoría con navegación contextual |
| `PageSkeleton` | `shared/components/feedback/skeleton.tsx` | Loading state consistente |
| `Timeline` | `shared/components/data/timeline.tsx` | Timeline append-only reutilizable |

### Utilidades

| Utilidad | Ruta | Propósito |
|----------|------|-----------|
| `groupAlerts` / `alertTone` | `shared/utils/alerts.ts` | Agrupación legacy de alertas |
| `exportLogsToTxt` | `shared/utils/export-log.ts` | Export TXT bitácora (client-side) |
| `ui-preferences` | `shared/utils/ui-preferences.ts` | Persistencia `visibleStatuses` y recordatorios kanban en localStorage |

### Hooks

| Hook | Ruta | Propósito |
|------|------|-----------|
| `useAllAssignments` | `hooks/use-all-assignments.ts` | Tab asignaciones equipo (fetch paralelo por proyecto) |
| `useKanbanNotifications` | `hooks/use-kanban-notifications.ts` | Browser Notification API para vencimientos y recordatorios |

---

## 3. Mejoras UX aplicadas por módulo

### Dashboard (`/`)

- **KPIs reducidos a 4 legacy:** Total proyectos, Rojo, Amarillo, Stoppers — con barras proporcionales (`KpiStrip`).
- **Panel coordinación premium:** proyectos que requieren acción, semáforo, aging, responsable, navegación a detalle.
- **Secciones completas:** estado ejecutivo, desglose semáforo, hitos próximos, stale, alertas preview, bitácora reciente, distribución pipeline (client-side), mini resumen comité.
- **Refresh automático** cada 60s vía TanStack Query (`refetchInterval`).
- **Jerarquía visual:** `PageHeader` + cards con densidad controlada + feed items escaneables.

### Proyectos (`/projects`)

- **FilterToolbar enterprise:** búsqueda, chips semáforo, pipeline, señales (stale/coord/stopper), multiselect estados visibles.
- **Persistencia `visibleStatuses`** en localStorage (`cit-v3-visible-statuses`) — paridad legacy.
- **ProjectCard refinada:** jerarquía nombre → pipeline → semáforo/badges → preview → meta (líder, equipo, tareas, fecha).
- **CRUD completo:** crear + **editar** (modal unificado) + eliminar desde card.
- **ProjectDetailPanel ampliado:** tabs Resumen, Actualizar, Timeline, Equipo, Riesgos, Actividades (kanban filtrado).
- **Formulario update append-only** con preview semáforo en vivo (`calcTrafficLight` client-side).
- **Deep link:** `?open={id}` desde dashboard/comité/alertas.

### Kanban (`/kanban`)

- **3 columnas** estilo Jira con borde superior de color por estado.
- **Drag & drop** entre columnas con feedback visual (opacity, bordes overdue/today).
- **Filtros** prioridad (chips) + área (select avanzado).
- **Modal CRUD** con edición inline (doble click), eliminar.
- **Badges** prioridad, área, proyecto, vencimiento, recordatorio.
- **Notificaciones browser** globales vía `AppShell` + `useKanbanNotifications` (overdue, hoy, recordatorios con deduplicación localStorage).

### Equipo (`/team`)

- **Tab Personas:** cards con rol, email, estado, proyectos activos, CRUD miembros.
- **Tab Asignaciones:** tabla enterprise (proyecto, líder, integrantes, semáforo, estado) vía `useAllAssignments`.
- **Tab Carga:** heatmap visual con barras proporcionales y colores por saturación (≥5 crítico, ≥3 medio).

### Bitácora (`/log`)

- **Timeline enterprise** agrupado temporalmente.
- **Filtro por área**, búsqueda client-side.
- **Append-only** con textarea + select área.
- **Eliminar entrada** individual.
- **Export TXT** implementado (`exportLogsToTxt`).

### OKRs (`/okrs`)

- **Progreso circular** por OKR (promedio actividades).
- **Tabla completa:** ID, actividad, responsable, dependencia, salida, slider avance, select estado.
- **Edición inline** vía PATCH actividad.
- **Metas Q1–Q4:** placeholder documentado (gap backend).

### Comité (`/committee`)

- **Vista ejecutiva premium** con 5 bloques legacy (portafolio, atención inmediata, seguimiento, carga, hitos 30d).
- **4 KPIs** + banner coordinación.
- **Imprimible** (`window.print()` + CSS `@media print` en `globals.css`).
- **Navegación contextual** a proyectos.

### Alertas (AppShell)

- **Campana** con badge count, refresh 60s.
- **AlertsPanel** categorizado: coordinación, bloqueos, stoppers, hitos, stale, kanban.
- **Navegación contextual** a `/projects?open={id}` o `/kanban`.

---

## 4. Mejoras visuales transversales

| Aspecto | Antes | Después |
|---------|-------|---------|
| Encabezados | Inconsistentes | `PageHeader` unificado en todos los módulos |
| KPIs dashboard | 6 KPIs duplicados | 4 KPIs legacy con barras |
| Filtros | Chips sueltos, pesados | `FilterToolbar` compacto, sticky, agrupado |
| Cards proyecto | Saturadas, sin jerarquía | Densidad inteligente, hover/focus, badges ordenados |
| Loading | Genérico | `PageSkeleton` por módulo |
| Empty/Error | Básico | `EmptyState` / `ErrorState` reutilizables |
| Tipografía | Mixta | Escala consistente (eyebrow uppercase, títulos bold, meta xs) |
| Spacing | Variable | `space-y-5/6`, padding `p-4/p-6`, rounded `2xl` |
| Hover/Focus | Parcial | Transitions + ring focus-visible en cards interactivas |
| Print | No | Comité imprimible |

---

## 5. Componentes refactorizados

| Archivo | Cambio |
|---------|--------|
| `dashboard-view.tsx` | Reescrito con KpiStrip, secciones legacy completas |
| `projects-view.tsx` | FilterToolbar, localStorage, edit modal, paginación |
| `project-card.tsx` | Nuevo componente card enterprise |
| `project-detail-panel.tsx` | 6 tabs, timeline, equipo, riesgos, actividades |
| `kanban-view.tsx` | Columnas Jira, DnD, filtros, modal |
| `team-view.tsx` | 3 tabs (Personas, Asignaciones, Carga) |
| `log-view.tsx` | Timeline, export TXT, búsqueda |
| `okrs-view.tsx` | Progreso circular, tabla inline edit |
| `committee-view.tsx` | Vista premium + print |
| `app-shell.tsx` | AlertsPanel + kanban notifications |

---

## 6. Gaps restantes (requieren backend o fase posterior)

| Gap | Impacto | Estado frontend |
|-----|---------|-----------------|
| OKR metas trimestrales Q1–Q4 | Medio | Placeholder + integración preparada en columna Metas |
| DELETE project update (historial) | Bajo | UI no expone delete; legacy sí permitía |
| Import/export JSON legacy | N/A | Oracle es source of truth — no aplica |
| Kanban modal: campo `reminderAt` en formulario | Bajo | Se muestra en card; edición reminder pendiente en modal |
| Kanban modal: `projectId` en formulario | Bajo | Asociación proyecto no editable en modal |
| Sidebar badges (kanban abiertos, logs hoy) | Bajo | No implementado en nav |
| Prefill formulario update desde último update | Medio | Parcial — campos vacíos al abrir tab Actualizar |
| Archivos/comité attachments | N/A | Placeholder no requerido en legacy funcional |

### Endpoints sugeridos (documentados, NO implementados)

```
GET  /api/v1/okrs/{id}/activities/{aid}/milestones
DELETE /api/v1/projects/{id}/updates/{updateId}
```

---

## 7. Validación

```bash
cd frontend
npm run lint   # ✅ sin errores
npm run build  # ✅ sin errores TypeScript
```

---

## 8. Contratos preservados

- Respuesta API estándar `{ code, message, userMessage, data }`
- Interceptors Axios, JWT, RBAC, paginación Spring
- Permisos por ruta (`PermissionGate`, `hasPermission`)
- TanStack Query keys existentes

---

## 9. Cobertura estimada post FASE 6.6

| Dimensión | Cobertura |
|-----------|-----------|
| Paridad funcional legacy | **~97%** |
| UX/UI enterprise | **~95%** |
| Gaps bloqueantes | **0** (solo OKR milestones y delete update son diferencias menores) |

Ver matriz detallada en `FASE_6_6_PARIDAD_100.md`.
