### Flowboard — Visualization-first Workflow Platform (Living Spec)

- Primary goal: real-time visualization of workflow executions from any service.
- Secondary: optional orchestration for UI-authored workflows.
- Editing model: copy-on-edit (saving creates a new workflowId; no lineage/alias for now).

---

## 1. Creation modes
- Mode 1: Ingestion-driven
  - Create minimal workflow (has START/END by default).
  - External service sends events using workflowId and correlationId.
  - Nodes/edges for each execution are built from events dynamically.
- Mode 2: UI-authored + trigger
  - Users design workflows in the UI with nodes and edges.
  - Trigger via API/UI; backend emits the same event shape as ingestion.
  - Edits create a new workflowId; past runs remain intact via snapshots.

---

## 2. Data model (PostgreSQL)
- workflows
  - id (UUID, PK)
  - name (VARCHAR), description (TEXT)
  - definition_json (JSONB) — authored nodes/edges, positions, inputs/globals
  - created_at, created_by
- workflow_executions
  - id (UUID, PK)
  - workflow_id (FK)
  - correlation_id (VARCHAR, indexed)
  - status (PENDING/RUNNING/SUCCESS/FAILED)
  - trigger_type (MANUAL/API/INGESTED)
  - trigger_input (JSONB)
  - definition_snapshot_json (JSONB, immutable per execution)
  - started_at, ended_at
- step_executions
  - id (UUID, PK)
  - workflow_execution_id (FK, indexed)
  - node_id_ref (VARCHAR)
  - status (PENDING/RUNNING/SUCCESS/FAILED)
  - input_payload (JSONB), output_payload (JSONB)
  - started_at, ended_at, duration_ms
- Suggested indexes
  - workflow_executions(correlation_id), step_executions(workflow_execution_id, node_id_ref)
  - GIN on step_executions.output_payload (later for deep search)

---

## 3. Schemas

### 3.1 Workflow definition (authoring)
- Keep explicit edges.
- START node may map trigger input to downstream.
- SUB_WORKFLOW node can pass input to child and extract outputs.

Key fields:
- name, description, tags, globals
- inputs: schema/defaults/example (optional)
- nodes: START, END, HTTP_REQUEST, DELAY, CONDITIONAL, JOIN, SUB_WORKFLOW
- edges: { id, source, target, sourcePort?, targetPort?, condition?, label? }

Reference: see `workflow-definition.json` in prior messages.

### 3.2 Execution snapshot (per run)
- Drives canvas rendering for a specific execution.
- Built from events (INGESTED or ENGINE) and persisted on first event.

Key fields:
- executionId, workflowId, correlationId, builtFrom(source), triggerInput
- nodes: { id, name, type, status, timings, input, output, error, ui.position }
- edges: { id, source, target, sourcePort?, targetPort?, reason?, label? }
- summary: { status, startedAt, endedAt }

### 3.3 Ingestion event
- Unified event shape for both modes.

Fields:
- workflowId (uuid), correlationId (string)
- triggerInput (object; only on first event of a run)
- occurredAt (ISO date-time)
- step: { id, name, type?, parents?, phase: START|UPDATE|COMPLETE|FAIL }
- input, output, error?, meta(sequence?, idempotencyKey?, attributes?)

Edges are derived as parents → child during execution snapshotting; authored flows already have edges in definition.

---

## 4. APIs (MVP)
- Authoring
  - POST /api/v1/workflows → create; returns workflowId
  - POST /api/v1/workflows/{id}/clone → copy-on-edit; returns new workflowId
  - GET /api/v1/workflows, GET /api/v1/workflows/{id}
- Execution
  - POST /api/v1/workflows/{id}/execute { input } → executionId
  - GET /api/v1/executions/{id}, GET /api/v1/executions/{id}/steps
- Ingestion
  - POST /api/v1/events → single event, 202 Accepted
  - POST /api/v1/events/bulk → bulk, 202 Accepted
- WebSockets (STOMP)
  - Endpoint: /ws (SockJS enabled)
  - Topics: /topic/workflows/{workflowId}/executions/{executionId}

---

## 5. Runtime & engineering standards
- Java 21 + Spring Boot 3.x (Servlet stack), virtual threads enabled:
  - spring.threads.virtual.enabled=true
- HTTP calls: Spring WebClient
- Beans over static utilities; Lombok for DTOs/entities
- Global error handling using Problem+JSON (to be added in flow-common)
- Security (later in MVP): Spring Security (JWT), RBAC (Admin/Editor/Viewer)
- Observability: OpenTelemetry (traces with correlationId), Micrometer metrics

---

## 6. Module layout (Maven)
- flow-common: shared WebClient, DTOs, error handling base
- flow-authoring-service: workflow CRUD & clone
- flow-ingestion-service: events ingestion → enqueue; returns 202
- flow-orchestration-service: optional execution engine trigger stub
- flow-api-service: WebSocket broker for live updates

---

## 7. Visualization & UX
- SPA: React + React Flow + Zustand + Tailwind
- Real-time canvas; node side panel shows input/output/duration/logs
- Search: by name/description initially; deep search via JSONB GIN later
- Layout: edges define topology; positions saved per execution snapshot for stability

---

## 8. Execution semantics (when engine is used)
- State machine per node: PENDING → RUNNING → SUCCESS/FAILED
- Parallel branches via edges; joins via JOIN node (policy ALL/ANY/COUNT)
- Retries/timeouts configurable per node runtime
- Sub-workflow: SYNC/ASYNC, inputMapping, outputExtract

---

## 9. Limits & retention (initial)
- Soft caps: nodes/workflow up to ~100, branches ≤ 5
- Rate limiting on ingestion endpoints (per account) — later
- Data retention: default 30 days (configurable)

---

## 10. Examples
- Example authoring definition and example events are documented in prior messages; to be mirrored into OpenAPI and JSON Schemas in repo.

---

## 11. Naming
- Project: flowboard


---

## 12. Next steps
- Add Problem+JSON error handling in flow-common
- Add OpenAPI specs per service
- Implement persistence (JPA entities for workflows, executions, steps)
- Implement RabbitMQ wiring for ingestion and orchestration
- Implement WebSocket broadcasting on updates

