# FASE 1 - Analisis funcional y entidades refinado

## Objetivo de la migracion

Convertir el tablero legacy basado en HTML, JavaScript vanilla, localStorage y respaldo JSON en una plataforma enterprise centralizada con frontend Next.js, backend Spring Boot y Oracle 19c como unica fuente de verdad para la informacion funcional.

El objetivo de preservacion no es replicar la implementacion tecnica legacy, sino conservar completamente la informacion, reglas, trazabilidad, relaciones y comportamiento funcional del sistema actual.

## Principios no negociables

1. `project_update` sera append-only.
2. Ningun historico funcional debe sobrescribirse.
3. Los timestamps originales del JSON deben conservarse.
4. Los semaforos historicos deben mantenerse como snapshots.
5. Las coordinaciones, riesgos, stoppers, hitos, decisiones y estados deben ser reconstruibles historicamente.
6. Oracle sera la fuente de verdad de negocio.
7. `localStorage` no se usara para persistencia funcional.
8. El JSON actual se usara solo como fuente inicial de migracion.
9. Se permiten PKs relacionales nuevas con sequences.
10. Se debe preservar `legacy_id` para auditoria, conciliacion y trazabilidad.

## Alcance funcional legacy detectado

El HTML legacy implementa una SPA monolitica con los siguientes modulos:

- Resumen ejecutivo: KPIs, proyectos por estado, semaforo, hitos, alertas y bitacora reciente.
- Actividades: Kanban de tareas con prioridad, area, estado, fecha limite, recordatorio y relacion opcional con proyecto.
- Proyectos: portafolio filtrable, tarjetas, semaforo, estado pipeline, tareas abiertas, equipo asociado y panel lateral.
- Seguimiento de proyectos: formulario de actualizacion, historico, stoppers, riesgos, hitos, decisiones y coordinacion.
- Equipos: catalogo de personas, asignaciones proyecto-persona, liderazgo tecnico y carga por recurso.
- Vista Comite: consolidado ejecutivo con atencion inmediata, seguimiento, recursos e hitos.
- OKRs & KRs: objetivos, actividades, avance, estado, responsables, dependencias, entregables y metas.
- Bitacora: registro diario de actividades por area y exportacion legacy a texto.
- Alertas: campana, recordatorios, vencimientos, proyectos sin actualizar, stoppers y coordinaciones.

## Persistencia legacy vs persistencia enterprise

### Legacy actual

- Estado funcional en `localStorage`.
- Export/import JSON como mecanismo manual de respaldo.
- Claves `cit-v3-*`.
- Migracion interna v2 a v3 dentro del HTML.

### Nueva plataforma

- Oracle 19c sera la unica fuente de verdad.
- Spring Boot sera responsable de persistencia, validacion, seguridad y auditoria.
- Next.js consumira APIs REST; no persistira datos funcionales en navegador.
- `localStorage` solo podra usarse para preferencias visuales, tema, cache temporal UI o estado no funcional.
- El JSON sera una entrada de migracion controlada, no un mecanismo operativo.

## Entidades funcionales refinadas

### Proyecto

Representa un elemento del portafolio IT.

Atributos legacy relevantes:

- `id`
- `name`
- `pipelineStatus`
- `start`
- `updatedAt`

Decision enterprise:

- Usar PK relacional nueva (`project_id`) con sequence.
- Conservar `legacy_id` como valor original exacto.
- Relacionar con updates, asignaciones, actividades Kanban y auditoria de migracion.
- No asumir que `legacy_id` es numerico.

### Actualizacion de proyecto

Entidad historica central del sistema.

Atributos legacy relevantes:

- `id`
- `projectId`
- `updatedAt`
- `generalStatus`
- `trafficLight`
- `summary`
- `pendingItems`
- `hasStopper`
- `stopperDesc`
- `stopperOwner`
- `stopperImpact`
- `relevantRisks`
- `nextMilestone`
- `nextMilestoneDate`
- `pendingDecisions`
- `requiresCoordination`
- `coordinationDesc`
- `responsibleArea`
- `responsibleAction`
- `additionalNotes`

Decision enterprise:

- Tabla append-only.
- No UPDATE funcional sobre registros historicos.
- Correcciones futuras deben crear nuevo registro o registrar evento/auditoria.
- Conservar `legacy_id`.
- Conservar `trafficLight` persistido como snapshot historico, aunque pueda recalcularse.
- Permitir reconstruir el estado del proyecto en una fecha pasada consultando el ultimo update <= fecha.

### Miembro de equipo

Atributos legacy relevantes:

- `id`
- `name`
- `roleLabel`
- `email`
- `active`
- `notes`

Decision enterprise:

- PK relacional nueva.
- `legacy_id` para trazabilidad.
- Rol base como catalogo o referencia controlada.
- Mantener asignaciones historicas y actuales por proyecto.

### Asignacion proyecto-persona

Atributos legacy relevantes:

- `id`
- `projectId`
- `memberId`
- `roleLabel`
- `isLead`

Decision enterprise:

- Relacion N:M normalizada entre proyecto y miembro.
- PK relacional nueva.
- `legacy_id` preservado.
- FK a proyecto y miembro.
- Constraint para controlar liderazgo unico por proyecto cuando aplique.
- Mantener rol de asignacion independiente del rol base de la persona.

### Actividad Kanban

Atributos legacy relevantes:

- `id`
- `text`
- `area`
- `priority`
- `status`
- `dueDate`
- `reminder`
- `projectId`
- `createdAt`

Decision enterprise:

- PK relacional nueva.
- `legacy_id` preservado.
- FK opcional a proyecto.
- Catalogos para area, prioridad y estado.
- Fechas originales conservadas.
- Recordatorios persistidos en backend, no en navegador.

### Bitacora

Atributos legacy relevantes:

- `id`
- `text`
- `area`
- `ts`

Decision enterprise:

- Tabla propia normalizada.
- `legacy_id` preservado.
- Texto libre sin truncamiento funcional.
- Area como catalogo.
- Timestamp original preservado.

### OKR

Atributos legacy relevantes:

- `id`
- `name`
- `activities`

Decision enterprise:

- Desanidar en tablas relacionales:
  - `okr`
  - `okr_activity`
  - `okr_activity_milestone`
- Conservar IDs legacy (`OKR-1`, `1.1`, etc.).
- Mantener avance, estado, responsable, dependencia, entregable y metas.

### Catalogos

Catalogos funcionales detectados:

- Estados pipeline: `Desarrollo`, `Planeación`, `Revisión`, `Recepción Hus`, `Certificación`, `Pausado`, `Finalizado`, `Sin información`.
- Estados ejecutivos: `En curso`, `En riesgo`, `Bloqueado`, `Requiere decisión`, `Completado`.
- Semaforos: `gris`, `verde`, `amarillo`, `rojo`.
- Areas: `plan`, `exec`, `stake`, `trans`, `cierre`, `cotidiana`, `seguimiento`.
- Prioridades: `alta`, `media`, `baja`.
- Estados Kanban: `pendiente`, `en-curso`, `hecho`.
- Impactos stopper: `Bajo`, `Medio`, `Alto`, `Crítico`.
- Areas responsables: `Coordinacion`, `Direccion`, `Gerencia`, `Delivery Manager`, `Product Delivery`, `Funcional`.
- Roles: `Líder Técnico`, `BE Java`, `BE Base de Datos`, `BE Data Science`, `Frontend`, `.Net`, `QA`, `DevOps`, `Otro`.

## Reglas de negocio refinadas

### Semaforo ejecutivo

El semaforo se calcula sobre la ultima actualizacion del proyecto, pero el valor persistido en cada update debe conservarse como evidencia historica.

Reglas actuales:

- Rojo:
  - `requiresCoordination = true`
  - `generalStatus = Bloqueado`
  - `hasStopper = true` y `stopperImpact` en `Alto`, `Crítico`
- Amarillo:
  - `generalStatus` en `En riesgo`, `Requiere decisión`
  - `hasStopper = true` y `stopperImpact` en `Bajo`, `Medio`
  - `relevantRisks` no vacio y `generalStatus = En curso`
- Verde:
  - `generalStatus` en `En curso`, `Completado` sin condiciones anteriores
- Gris:
  - Sin actualizacion o sin regla aplicable

### Estado historico reconstruible

Para reconstruir el estado de un proyecto a una fecha determinada:

1. Buscar el proyecto por PK o `legacy_id`.
2. Consultar `project_update` del proyecto con `updated_at <= fecha`.
3. Tomar el registro mas reciente por `updated_at`.
4. Usar sus campos historicos: `traffic_light`, `general_status`, `summary`, stoppers, riesgos, hitos y coordinacion.

### Liderazgo tecnico

Debe existir como maximo un lider activo por proyecto para una vista operacional actual. Si se requiere historia de asignaciones en el futuro, debe modelarse con vigencias (`valid_from`, `valid_to`) o tabla de eventos.

### Coordinaciones

`requiresCoordination` y `coordinationDesc` son informacion ejecutiva critica. Deben conservarse y ser consultables por proyecto, periodo, responsable y estado.

### Stoppers y riesgos

Los stoppers y riesgos no son simples notas. Afectan el semaforo, la vista comite, alertas y priorizacion ejecutiva.

## Riesgos de migracion

- IDs legacy con tipos mixtos (`number` y `string`).
- IDs generados por timestamp JavaScript.
- Un ID de proyecto excede precision segura de JavaScript.
- Campos opcionales representados como string vacio en lugar de null.
- Texto libre con informacion sensible de negocio, URLs, SACs y JSON embebido.
- `trafficLight` puede ser recalculable, pero debe preservarse como snapshot original.
- Hay proyectos sin updates o sin asignaciones, lo cual debe considerarse valido.

## Criterio para fases siguientes

La FASE 2 debe disenar una arquitectura que preserve este comportamiento, elimine la persistencia local legacy, centralice informacion en Oracle, exponga APIs REST robustas y mantenga contratos DTO alineados entre backend y frontend.
