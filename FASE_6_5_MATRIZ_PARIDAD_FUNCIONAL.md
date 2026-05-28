# FASE 6.5 — Matriz de paridad funcional

**Estado:** En migración activa  
**Última actualización:** 2026-05-28

Leyenda: ✅ Implementado | 🔄 En progreso | ❌ Pendiente | ➖ N/A

Ver análisis completo en `FASE_6_5_ANALISIS_LEGACY_FUNCIONAL.md`.

| Módulo | Funcionalidad legacy | Endpoint | Pantalla | Estado |
|--------|---------------------|----------|----------|--------|
| Semáforo | calcTrafficLight | POST /projects/{id}/updates | Form update | ✅ BE / 🔄 FE |
| Dashboard | KPIs + desgloses | GET /dashboard/executive | / | 🔄 |
| Dashboard | Alertas | GET /dashboard/alerts | Header bell | 🔄 |
| Comité | Vista ejecutiva 5 bloques | GET /committee/summary | /committee | 🔄 |
| Proyectos | Cards + filtros | GET /projects?filters | /projects | 🔄 |
| Proyectos | CRUD | POST/PUT/DELETE /projects | Modal | 🔄 |
| Proyectos | Timeline append-only | GET/POST /projects/{id}/updates | Drawer | 🔄 |
| Proyectos | Asignaciones | /projects/{id}/assignments | Drawer tab | ✅ BE / 🔄 FE |
| Kanban | DnD + CRUD | PATCH/PUT/DELETE /kanban/cards | /kanban | ✅ BE / 🔄 FE |
| Bitácora | Append-only + filtros | GET/POST/DELETE /activity-logs | /log | ✅ BE / 🔄 FE |
| Equipos | Miembros CRUD | /team-members | /team | ✅ BE / 🔄 FE |
| Equipos | Carga recursos | GET /committee/summary | /team | 🔄 |
| OKRs | Edición pct/status | PATCH /okrs/.../activities | /okrs | ✅ BE / 🔄 FE |

**Cobertura pre FASE 6.5:** ~35%  
**Target:** 100% paridad funcional
