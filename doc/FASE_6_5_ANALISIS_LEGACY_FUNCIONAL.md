# FASE 6.5 — Análisis funcional completo del sistema legacy HTML/JSON

**Fuente:** `tablero_coordinadora_it_v3_3_3.html` + `tablero_IT_respaldo_2026-05-19.json`  
**Versión legacy:** v3.3.3  
**Fecha análisis:** 2026-05-28

---

## 1. Arquitectura legacy

| Aspecto | Implementación legacy |
|---------|----------------------|
| UI | SPA monolítica en un único HTML (~2365 líneas) |
| Estado | Objeto global `S` en memoria |
| Persistencia | `localStorage` con claves `cit-v3-*` |
| Respaldo | Export/import JSON manual |
| Navegación | 7 vistas: `resumen`, `comite`, `kanban`, `proyectos`, `equipos`, `okrs`, `log` |
| IDs | `nid()` = timestamp + random |

### Entidades en estado (`S`)

| Entidad | Clave localStorage | Campos principales |
|---------|-------------------|-------------------|
| Proyectos | `cit-v3-projects` | id, name, pipelineStatus, start, updatedAt |
| Updates | `cit-v3-project-updates` | 18 campos (append-only) |
| Asignaciones | `cit-v3-project-assignments` | id, projectId, memberId, roleLabel, isLead |
| Miembros | `cit-v3-team-members` | id, name, roleLabel, email, active, notes |
| Kanban | `cit-v3-kanban` | id, text, area, priority, status, dueDate, reminder, projectId, createdAt |
| Bitácora | `cit-v3-logs` | id, text, area, ts |
| OKRs | `cit-v3-okrs` | id, name, activities[] |
| Recordatorios | `cit-v3-shown-rem` | Set de IDs ya mostrados |
| Filtros UI | `cit-v3-visible-statuses` | Array pipeline statuses visibles |

---

## 2. Catálogos y constantes

### Pipeline statuses
`Desarrollo`, `Planeación`, `Revisión`, `Recepción Hus`, `Certificación`, `Pausado`, `Finalizado`, `Sin información` (ghost projects)

### Estados ejecutivos (`EXEC_STATUSES`)
`En curso`, `En riesgo`, `Bloqueado`, `Requiere decisión`, `Completado`

### Impacto stopper (`IMPACT_LEVELS`)
`Bajo`, `Medio`, `Alto`, `Crítico`

### Semáforos
`verde`, `amarillo`, `rojo`, `gris` (sin datos)

### Kanban status
`pendiente`, `en-curso`, `hecho`

### Kanban priority
`alta`, `media`, `baja`

### Kanban areas
`plan`, `exec`, `stake`, `trans`, `cierre`, `cotidiana`, `seguimiento`

### Áreas responsables (updates)
`Coordinacion`, `Direccion`, `Gerencia`, `Delivery Manager`, `Product Delivery`, `Funcional`

### Visible statuses default
Todos excepto `Finalizado`

---

## 3. Regla central: `calcTrafficLight(upd)`

Prioridad descendente (primera coincidencia gana):

| Regla | Condición | Resultado |
|-------|-----------|-----------|
| R1 | `requiresCoordination === true` | ROJO |
| R2 | `generalStatus === 'Bloqueado'` | ROJO |
| R3 | `hasStopper && impacto in ['Alto','Crítico']` | ROJO |
| A1 | `generalStatus in ['En riesgo','Requiere decisión']` | AMARILLO |
| A2 | `hasStopper && impacto in ['Bajo','Medio']` | AMARILLO |
| A3 | `relevantRisks.trim() && generalStatus === 'En curso'` | AMARILLO |
| V1 | `generalStatus in ['En curso','Completado']` | VERDE |
| default | — | GRIS |

**Preview en vivo:** al editar formulario de update, recalcula semáforo antes de guardar.

---

## 4. Módulo RESUMEN (Dashboard ejecutivo)

### KPIs principales
- Total proyectos
- Conteo semáforo rojo / amarillo
- Proyectos con stopper
- Barras proporcionales rojo/amarillo/stopper

### Secciones derivadas

| Sección | Lógica | Interacción |
|---------|--------|-------------|
| Coordinación | `lu.requiresCoordination` | Click → abre panel proyecto |
| Desglose estado ejecutivo | Agrupa por `generalStatus` del latest update | Solo lectura |
| Desglose semáforo | Agrupa por `calcTrafficLight(lu)` | Solo lectura |
| Próximos hitos | `nextMilestoneDate >= today`, top 5 ASC | Solo lectura |
| Proyectos stale | `daysDiff(updatedAt) > 7`, top 5 DESC | Solo lectura |
| Alertas preview | `computeAlerts().slice(0,6)` | Solo lectura |
| Bitácora reciente | `S.logs.slice(0,5)` | Solo lectura |

### Automatismos
- Refresh cada 60s si vista activa
- `checkAlerts()` cada 60s

---

## 5. Módulo COMITÉ (Vista ejecutiva)

### Bloque 1 — Portafolio
Total, rojo, amarillo, verde, con stopper, sin actualizar (>7d), banner coordinación

### Bloque 2 — Atención inmediata
Proyectos con `tl==='rojo' OR requiresCoordination`, ordenados: coordinación primero

### Bloque 3 — Seguimiento
Unión de: amarillos + hitos próximos 14d + stale >7d (deduplicados), max 8

### Bloque 4 — Carga recursos
Top 10 miembros activos por cantidad asignaciones, barra proporcional

### Bloque 5 — Hitos 30 días
`nextMilestoneDate` entre today y today+30, ordenados ASC

**Interacción:** click fila → nav proyectos + openPanel(id)

---

## 6. Módulo PROYECTOS (crítico)

### Cards — datos mostrados
- Nombre, pipeline badge
- Semáforo calculado, estado ejecutivo badge
- Badge coordinación, stopper + impacto
- Áreas involucradas (rojo/amarillo)
- Preview summary (120 chars) o "Sin actualizaciones"
- Lead, count asignaciones, count tareas abiertas kanban
- Indicador stale (>7 días)
- Botones editar/eliminar (stop propagation)

### Filtros

| Filtro | Variable | Comportamiento |
|--------|----------|----------------|
| Pipeline chip | `projFilter` | Un status o "Todos" |
| Semáforo chip | `tlFilter` | verde/amarillo/rojo/gris o vacío |
| Estados visibles | `visibleStatuses[]` | Multiselect dropdown, persiste localStorage |

### Side panel — 3 tabs

#### Tab Update (formulario append-only)
Campos: generalStatus*, summary*, pendingItems, hasStopper, stopperImpact, stopperDesc, stopperOwner, relevantRisks, nextMilestone, nextMilestoneDate, pendingDecisions, requiresCoord, coordinationDesc*, responsibleArea, responsibleAction, additionalNotes

Validaciones:
- summary obligatorio
- coordinationDesc obligatorio si requiresCoord
- Al guardar: **nuevo registro** en projectUpdates (no edita anterior)
- Actualiza `project.updatedAt`
- Calcula y persiste trafficLight
- Redirige a tab history

#### Tab History (timeline append-only)
- Orden DESC por updatedAt
- Acordeón expandible
- Muestra todos los campos no vacíos
- Permite eliminar registro individual (legacy permite delete)

#### Tab Team
- Muestra lead destacado
- Lista integrantes con rol
- Quitar asignación inline
- Botón "+ Asignar persona" → modal assign

### CRUD proyecto
- Crear: name*, pipelineStatus, start
- Editar: mismos campos
- Eliminar: cascade updates + assignments

---

## 7. Módulo KANBAN

### Columnas
pendiente | en-curso | hecho

### Card
- area, priority (dot color), text
- dueDate con severidad: overdue / today
- project badge
- reminder datetime
- Delete button

### Filtro prioridad
`kanbanFilter`: all | alta | media | baja

### Drag & drop
- dragStart → dragging class
- dragOver → placeholder
- drop → cambia status, save, re-render, checkAlerts

### CRUD modal
text*, area, priority, status, dueDate, reminder, projectId

### Automatismos alertas kanban
- overdue: dueDate < today && status != hecho
- today: dueDate === today
- reminder: reminder <= now && no mostrado antes (shownRem Set)
- Browser Notification API si permiso granted

---

## 8. Módulo EQUIPOS

### Tab Members
Grid cards: name, roleLabel, email, active, proyectos asignados (max 3)
CRUD: openMemberModal, saveMember, deleteMember (cascade assignments)

### Tab Assign
Tabla: proyecto | lead | integrantes
Chips con botón quitar asignación
Modal assign: member, project, roleLabel, isLead (unset previous lead)

### Tab Carga
Tabla sortable (name, count):
- Barra carga proporcional al max
- Colores: >=5 coral, >=3 amber, else blue
- Expand detail: metadata + lista proyectos clickeables

---

## 9. Módulo OKRs

Por OKR:
- Header con progreso circular = promedio pct actividades
- Tabla actividades: id, text, resp, dep, salida, slider pct, select status, metas chips

Edición inline:
- `updateActPct(oi, ai, val)` → slider 0-100
- `updateActStatus(oi, ai, val)` → select

Estados actividad: Pendiente, En curso, Completado, Bloqueado

Metas: chips por trimestre (Q1-Q4, Q1-27) con mes y pct

---

## 10. Módulo BITÁCORA (log)

### Entrada
- textarea multiline
- select area
- Enter o botón → prepend con ts ISO

### Render
- Agrupado por fecha DESC
- Hora, texto, chip area
- Delete individual

### Export
- TXT plano: `[fecha hora] [area] texto`

---

## 11. Sistema de alertas (`computeAlerts`)

### Proyectos (scope: project)
| Tipo | Condición | Tag |
|------|-----------|-----|
| coord | requiresCoordination | 🚨 Coordinación |
| blocked | generalStatus Bloqueado | 🔴 Bloqueado |
| stopper | hasStopper + Alto/Crítico | 🛑 Stopper |
| milestone | nextMilestoneDate < today | 📅 Hito vencido |
| stale | days>7 && !lu | ⏳ Sin actualizar |

### Kanban (scope: kanban)
| Tipo | Condición | Tag |
|------|-----------|-----|
| overdue | dueDate < today | ⚠️ Vencida |
| today | dueDate === today | 📅 Hoy |
| reminder | reminder <= now | 🔔 Recordatorio |

### UI alertas
- Bell icon con count badge
- Panel dropdown agrupado Proyectos / Actividades
- Click proyecto → nav + openPanel

---

## 12. Funciones auxiliares

| Función | Propósito |
|---------|-----------|
| `latestUpdate(projectId)` | Update más reciente por updatedAt |
| `daysDiff(dateStr)` | Días desde fecha |
| `dueSev(due, status)` | overdue/today/null |
| `fmtDate` / `fmtDT` | Formato dd/mm/yyyy |
| `areaLbl(a)` | Label área kanban/log |
| `tlHtml` / `esBadge` | Render badges |
| `updateBadges()` | Contadores sidebar |
| `showToast(msg, type)` | Feedback UI |
| `confirmAction` | Modal confirmación |
| `exportData` / `importData` | Backup JSON |
| `migrateV2toV3` | Migración esquema antiguo |

---

## 13. Reglas de negocio implícitas

1. **Stale threshold:** 7 días sin `project.updatedAt`
2. **Coordinación = máxima prioridad** en semáforo y alertas
3. **Un solo lead por proyecto** (al asignar nuevo lead, unset anterior)
4. **Ghost projects** (id >= 9000001) para equipos sin proyecto en migración v2
5. **Append-only updates** con prefill desde último update al crear nuevo
6. **Semáforo nunca manual** — siempre calculado
7. **Kanban badge sidebar** = cards con status != hecho
8. **Log badge sidebar** = entradas de hoy
9. **Carga alta** visual: >=5 proyectos = crítico, >=3 = medio

---

## 14. Datos JSON respaldo (2026-05-19)

| Entidad | Cantidad |
|---------|----------|
| Proyectos | 18 |
| Updates | 57 |
| Asignaciones | 46 |
| Miembros | 12 |
| Kanban | 4 |
| Logs | 16 |
| OKRs | 3 |

Migrados a Oracle vía `PKG_LEGACY_JSON_MIGRATION`.

---

## 15. Gap actual Next.js (pre FASE 6.5)

| Área legacy | Cobertura previa |
|-------------|------------------|
| Dashboard KPIs completos | ~15% |
| Proyectos cards + panel + timeline | ~10% |
| Filtros avanzados | 0% |
| Kanban DnD + CRUD | ~20% |
| Bitácora | 0% |
| Equipos carga/asignaciones | ~25% |
| OKRs edición | ~30% |
| Comité | 0% |
| Alertas | 0% |
| Import/export JSON | N/A (Oracle es source of truth) |
