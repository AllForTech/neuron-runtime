# 0003 — Target module boundaries, dependency direction, and abstraction strategy for Neuron Runtime

- Status: proposed
- Date: 2026-11-19
- Owners: architect
- Related tasks: T-001, T-002, T-003, T-004 (security input pending), T-005

## Context

This ADR is a read-only architectural assessment. No source, test, config, or documentation was changed. It is grounded in direct file inspection plus the verified T-001/T-002 summaries.

### Mandated instruction files

- `AGENTS.md:25-26` mandates reading `@context/NEURON_RUNTIME.md` first. That file does not exist (read returned "File not found"). Already recorded as P-001 in `.agents/ledger.yaml:16-19`.
- `context/DESIGN_RULES.md` was read in full (105 lines). It is a UI design-system specification (OKLCH tokens, radii, motion), not an architecture contract. It imposes no module-boundary constraints on this decision, except that visual tokens must remain semantic (`context/DESIGN_RULES.md:21-35`).
- `.agents/ownership.yaml:2-3` records that no project path ownership existed at task start. Leases for implementation are proposed in the Migration plan below.

### Observed structure (every claim cited)

**Workspace and build graph**
- pnpm workspace covers `apps/*`, `packages/*`, `packages/sdk/*`, `tooling/*` (`pnpm-workspace.yaml:1-5`); Turbo build has `dependsOn: ["^build"]` (`turbo.json:6-9`).
- Root `check-types`/`lint` delegate to Turbo (`package.json:7,9`), but only `packages/ui` actually defines `check-types` and `lint` scripts (`packages/ui/package.json:21-22`). `apps/api/package.json:7-12` defines neither; `apps/web/package.json:9` uses `next lint .`, removed in Next 16 (`apps/web/package.json:67` pins `next@16.1.6`).
- CI runs `pnpm build` only (`.github/workflows/ci.yml:33-35`); job is mislabeled "Build and Test" (`:11`). CI installs pnpm 8 (`:20-22`) while root pins `pnpm@9.0.0` (`package.json:21`). No `*.test.*`/`*.spec.*` files exist anywhere in `apps/`, `packages/`, or `tooling/`.
- `apps/api` depends on `@neuron/auth`, `@neuron/db`, `@neuron/shared`, `@neuron/runtime` (`apps/api/package.json:16-32`).
- `apps/web` depends directly on `@neuron/db` (`apps/web/package.json:37`); 15 web source files import from it (`WorkflowEditorProvider.tsx:20`, `lib/utils.ts:18`, `providers/DashboardContext.tsx:12`, `components/workflow/editor/executions/LogsTimeline.tsx:24`, and 11 more).
- `@neuron/runtime` depends on `@neuron/db` (`packages/runtime/package.json:16-20`); `@neuron/db` depends on `@neuron/auth` and `@neuron/shared` (`packages/db/package.json:19-26`).

**Domain engine coupled to persistence and UI semantics**
- `packages/runtime/src/execution/runtime.ts:11` imports `getGlobalVariables`, `VaultService`, `workflowBroadcast`, `WorkflowEdge`, `WorkflowNode` from `@neuron/db`.
- `runtime.ts:7` imports `WorkflowEditorActionType` from `@neuron/shared` — an editor UI action enum (`packages/shared/src/constants/index.ts:1-24`) — and emits it at `:115`, `:144`, `:168-173`, `:189`.
- `runtime.ts:37-49` constructs `new VaultService(params.userId)` and `workflowBroadcast(params.workflowId)` inside the domain constructor; `runtime.ts:54` performs a DB read in `initialize()`.
- `workflowBroadcast` is a Supabase realtime adapter living in the persistence package (`packages/db/src/realtime/workflowBroadcast.ts:1-12`, exported at `packages/db/src/index.ts:6`). The engine therefore reaches persistence → auth → Supabase for a notification.
- A dedicated port already exists and is already used by template resolution: `IVaultResolver` (`packages/shared/src/types/vault.ts:1-3`, consumed at `packages/runtime/src/utils/index.ts:1,32,66,113,125`). Only the `Runtime` constructor bypasses it.
- Two competing editor-action enums exist: shared (`packages/shared/src/constants/index.ts:1-24`) and web-local (`apps/web/constants/index.ts:141-173`). The three events the engine emits have identical wire strings in both (shared `:17-19` = web `:157-159`); web's enum is a superset (`:165-172`).
- `WorkflowNode`/`WorkflowEdge` have competing representations: domain shapes in `@neuron/shared` (`packages/shared/src/types/nodes.ts:249-260`, `edges.ts:1-9`) vs Drizzle row shapes in `@neuron/db` (`packages/db/src/types/index.ts:29,32`). The web provider already performs an explicit row→domain translation (`WorkflowEditorProvider.tsx:306-314`, `positionX/Y` → `position:{x,y}`).
- `Runtime` calls `Date.now()` (`runtime.ts:153`) and writes debug `console.log` (`:215-217`) inside domain logic — minor isolation leaks.

**Transport layer performs orchestration and persistence directly**
- All API controllers call `@neuron/db` repositories directly; there is no application/use-case layer (`workflow.controllers.ts:2-11`, `execution.controller.ts:3-13`, `vault.controllers.ts:2-7`, `workspace.controller.ts:3-9`, `deploy.workflow.controller.ts:1-10`).
- `workflow.controllers.ts:316-369` and `deploy.workflow.controller.ts:173-282` duplicate create-execution → execute → update-status orchestration with **different semantics**: the first is fire-and-forget with `202 Accepted` (`:346-368`); the second awaits and projects `finalContext.response` into status/headers/body (`:227-256`). Both call the same thin wrapper `apps/api/src/engine/execution.ts:12-44`.
- Two authentication paths exist in controllers: `req.user` from middleware (`workflow.controllers.ts:317`, `execution.controller.ts:31`) and a direct Supabase `getUser(token)` call inside the deploy controller (`deploy.workflow.controller.ts:18-40`).
- Validation is inline and inconsistent: `workflow.controllers.ts:220-224` uses an array check; `:281-285` uses a different shape check; `:294-305` contains unreachable error branches (`if (error)` then `if (error.message)` on the same truthy value).
- `apps/api/src/index.ts:64-74` registers `unhandledRejection`/`uncaughtException` handlers that log and deliberately keep the process running. Security/ops invariant to preserve or change only with T-004 sign-off.

**Duplicated engine code**
- Two transform executors are near-verbatim copies: `apps/api/src/engine/node-registrys/transform.node.ts:4-8,20-48` and `packages/sdk/node-transform/src/execution/execution.ts:5-9,17-45`. Both duplicate `normalizeTransformCode` and the `vm2` `NodeVM` config. The SDK copy is canonical-shaped (`NodeExecutor` contract, `packages/shared/src/types/sdk.ts:4-18`) and is the one actually wired into execution via `packages/nodes/src/server/index.ts:1-16` and `NodeRunner` (`packages/runtime/src/execution/nodeRunner.ts:2,11`).
- Two branching implementations with **divergent semantics**: `packages/runtime/src/utils/branching.ts:4-56` (typed; `Trigger.`/`Logic.Condition`/`Logic.Decision`; failure-signal fallback at `:34-47`) vs `apps/api/src/engine/runtime/branching.ts:1-30` (`any`; legacy `"condition"`/`"decisionNode"`; no signal handling). Only the runtime copy is live.
- Two registries: `packages/nodes/src/client/index.ts:31-39` + `packages/nodes/src/server/index.ts:15-30` (current `NODE_KIND` keys) vs `apps/api/src/engine/node.registry.ts:14-193` (legacy keys `"trigger"`, `"httpNode"`, `"condition"`, ...). A third web-local registry `apps/web/registry/nodeRegistry.ts:34-45` also uses legacy keys and holds React icons/validation, a different responsibility.
- The legacy API engine is dead code except `execution.ts`: `node.registry.ts` has no live importer (only self-imports at `:10-12` and a commented-out reference at `apps/api/src/engine/runtime/node.runtime.ts:1`); `resolveNextNodes` has no callers; `node.runtime.ts:1-65` and `apps/api/src/engine/resolveTemplate.ts:23` are entirely commented out.

**Web editor god-module**
- `apps/web/providers/WorkflowEditorProvider.tsx` is 595 lines and exposes ~45 context values (`:574-591`). It contains: context/type declarations (`:45-133`), three inline reducers (`:174-254`), derived React Flow state (`:256-283`), realtime wiring (`:285`), session/token access (`:287-292`), cloud load (`:294-330`), cloud save with a 5-step retry schedule and three mutable refs (`:135`, `:140-141`, `:168-170`, `:332-399`), Dexie draft reads/writes (`:172`, `:348`, `:542-568`), graph CRUD (`:401-435`), run/deploy/delete (`:437-509`), logs (`:511-531`), and ~12 independent UI booleans (`:143-166`) despite an existing `editorUIReducer` (`:21-22`).
- Three duplicated state representations: (a) node status/outputs/errors live in `editorState.runtime` (`:102-107`, consumed by `TriggerNode.tsx:27`, `DynamicNode.tsx:49-50`, `DynamicNodeToolbar.tsx:36-42`, `NodesInspector.tsx:66`, `ExecutionTrace.tsx:36-39`) **and** in `runtimeState` (`:126-131`, reducer `:226-254`, no component consumers); (b) executions in both `editorState.runtime.executions` (`:321`, no consumers) and `runtimeState.executions` (`:232-238`, consumed by `ExecutionHistoryPanel.tsx:20-25`); (c) logs in both `runtimeState.logs` (`:239-246`, consumed by `ExecutionLogsViewer.tsx:105`) and local `logs`/`setLogs` (`:165`, `:590`, no consumers).
- `useWorkflowRealtime.tsx:6-35` is already a separated adapter, but takes untyped dispatchers (`:8-9`) and forwards unvalidated realtime payloads directly into reducers (`:19-29`).

**Pre-existing defects observed (not introduced by this ADR)**
- `VaultService.resolve` computes `decryptedSecret`, caches it, then returns `secret.content` (`packages/db/src/services/VaultService.ts:23-26`) — first call returns raw content, later calls return decrypted. Any vault port migration must deliberately preserve or fix this, not copy it accidentally.
- `addNodeController` error handling is unreachable for 404 (`workflow.controllers.ts:294-305`).
- Hardcoded hex colors in editor edge styling (`WorkflowEditorProvider.tsx:276-277`) conflict with `context/DESIGN_RULES.md:21-35`.

## Decision

### D1 — Six-layer boundary model

```
transport          apps/api/src/{routes,controllers}/** ; apps/web/{app,components,providers}/**
   |  calls (validated DTOs only)
application        apps/api/src/application/** (NEW): use-cases, one per command/query
   |  depends on
domain             @neuron/runtime (pure engine) + @neuron/nodes (contracts + executors)
   |  depends only on
ports              @neuron/shared/src/ports/** (interfaces owned by the domain)
   ^  implemented by
adapters           @neuron/db repositories, @neuron/auth, @neuron/client, realtime sink, Dexie draft store
   |               
infra              Drizzle/Postgres, Supabase, IndexedDB
```

- Composition root for the API is `apps/api/src/index.ts:18-62`: it alone constructs adapters and injects them into use-cases. Composition root for the web editor is `WorkflowEditorProvider.tsx`, after it is reduced to composition only.
- Ports live in `@neuron/shared` under a `ports` module (with an explicit export path). **No new package is created** for ports: `IVaultResolver` already lives there (`packages/shared/src/types/vault.ts:1-3`). Adding a package now would be a speculative abstraction.
- `@neuron/shared` is explicitly designated the *contracts* package (domain types, ports, node SDK contracts). Its UI-only enum (`packages/shared/src/constants/index.ts:1-24`) is removed once the engine stops importing it; UI action types belong to `apps/web/constants/index.ts:141-173`.

### D2 — Dependency direction rules (enforceable by CI later)

| Rule | Current state | Target |
|---|---|---|
| `@neuron/runtime` → `@neuron/db` | present (`runtime.ts:11`, `nodeRunner.ts:1`, `branching.ts:2`, `types/index.ts:1`) | **forbidden** |
| `@neuron/runtime` → editor UI enums | present (`runtime.ts:7,115,144,168-173,189`) | **forbidden** |
| `@neuron/runtime` → `@neuron/shared` + `@neuron/nodes/server` | present | **only allowed edges** |
| `@neuron/db` → `@neuron/runtime` | absent | forbidden |
| `apps/api` controllers → `@neuron/db` | present everywhere | forbidden (go through application) |
| `apps/web` → `@neuron/db` | 15 files | forbidden; use `@neuron/client` + shared contracts |
| adapters → ports | absent | required (adapters implement domain-owned interfaces) |
| domain → ports, never adapter | `IVaultResolver` precedent exists | required |
| cross-package relative imports | not observed in scope | forbidden (`AGENTS.md:686-689`) |

### D3 — Decoupling `@neuron/runtime` without behavior change

Inject three collaborators through `ExecuteWorkflowType` (`packages/runtime/src/types/index.ts:13-18`), reusing existing contracts where possible:

1. `vault: IVaultResolver` — reuse `packages/shared/src/types/vault.ts:1-3`. Removes `new VaultService(...)` (`runtime.ts:37,46`); the template resolver already accepts it (`runtime/src/utils/index.ts:32,66,113,125`). The adapter implementing it is a thin wrapper over the current `VaultService` plus its known cache quirk (see Context).
2. `variables: WorkflowVariableSource` — new one-method port (`getForWorkflow(workflowId): Promise<Record<string,string>>`) replacing `getGlobalVariables` (`runtime.ts:54`). Adapter delegates to the existing repository (`packages/db/src/repository/global.variables.repository.ts:6`).
3. `events: WorkflowEventSink` — new one-method port (`emit(event: DomainExecutionEvent): Promise<void>`) replacing `workflowBroadcast(...).dispatch` (`runtime.ts:38,48`). Domain event vocabulary: `{ type: "node.started" | "node.succeeded" | "node.failed", nodeId, output?, error? }`.
   - A single adapter (`apps/api/src/adapters/WorkflowRealtimeEventSink.ts`) maps domain events to the **existing wire contract** — event channel `workflow_action` and payload `{ type, ...payload }` (`packages/db/src/realtime/workflowBroadcast.ts:3-11`) with the **existing string values** `NODE_EXECUTION_START/SUCCESS/ERROR` (`packages/shared/src/constants/index.ts:17-19`, `apps/web/constants/index.ts:157-159`). No UI event payload changes; no web consumer changes.
   - Later, the same port can fan out to logs/metrics without touching the engine.

Additionally, replace the four `@neuron/db` type imports with `@neuron/shared` domain types, and move the row→domain mapping (`WorkflowEditorProvider.tsx:306-314`) into a single pure mapper at the application boundary. **This mapping is a correctness requirement, not cosmetic**: DB rows use `positionX/Y`, domain nodes use `position:{x,y}`. Do not simply swap import paths.

### D4 — Split `WorkflowEditorProvider.tsx`

Keep the public `useWorkflowEditor()` hook (`apps/web/hooks/workflow/useWorkflowEditor.tsx:3-8`) and the context value shape **unchanged during step 1**; all consumers (61 call sites) remain untouched. Extract by responsibility:

| New file (all under `apps/web/`) | Responsibility | Source lines |
|---|---|---|
| `providers/WorkflowEditorProvider.tsx` | composition root only (~60 lines) | `:137-172`, `:574-596` |
| `state/workflowEditorReducer.ts` | pure graph + node-execution reducer | `:174-224` |
| `state/runtimeReducer.ts` | pure runs/logs reducer | `:226-254` |
| `lib/graphMappers.ts` | pure row→domain/React Flow mappers | `:256-283`, `:306-314` |
| `hooks/workflow/useWorkflowDraft.ts` | Dexie local draft, single read owner | `:172`, `:542-568` |
| `hooks/workflow/useWorkflowCloudSync.ts` | load/save + retry state machine, explicit inputs | `:287-399` |
| `hooks/workflow/useWorkflowCommands.ts` | run/deploy/delete deployment | `:437-509` |
| `hooks/workflow/useExecutionLogs.ts` | log fetch + loading state | `:511-531` |
| `hooks/workflow/useWorkflowGraphSelection.ts` | selection, template insert, fitNode | `:401-435`, `:533-535` |
| `hooks/workflow/useWorkflowRealtime.tsx` | keep; type dispatchers, validate payload | `:6-35` |

State ownership after split (deterministic, single owner per slice):
- Node status/outputs/errors/active edges: **`editorState.runtime`** (it is the live representation per the consumers listed in Context). Delete the unused copies from `runtimeReducer` (`runtime.tsx:226-248` nodeStatus/activeEdges branches) only after a grep confirms zero consumers.
- Executions and logs: **`runtimeState`** (live per `ExecutionHistoryPanel.tsx:20-25`, `ExecutionLogsViewer.tsx:105`). Delete `SET_EXECUTIONS` from the workflow reducer and the local `logs`/`setLogs` state.
- Panel/UI booleans: consolidate into the existing `editorUIReducer` (`WorkflowEditorProvider.tsx:21-22`) rather than inventing a fourth reducer.
- Data flow remains one-directional: realtime/HTTP effects dispatch typed actions → reducers → derived selectors → context. No effect writes another hook's state directly.

### D5 — Consolidation strategy for duplicated code

| Duplicate | Canonical | Delete/deprecate | Rationale |
|---|---|---|---|
| Transform executor | `packages/sdk/node-transform/src/execution/execution.ts:11-67` | `apps/api/src/engine/node-registrys/transform.node.ts:1-67` | SDK copy matches `NodeExecutor` (`shared/src/types/sdk.ts:4-18`) and is the copy actually executed (`nodes/src/server/index.ts:1,16`; `nodeRunner.ts:2,11`). Bodies are otherwise identical. |
| Branching | `packages/runtime/src/utils/branching.ts:4-56` | `apps/api/src/engine/runtime/branching.ts:1-30` | Only runtime copy is live; API copy uses legacy node types and lacks failure-signal routing. |
| Registry | `packages/nodes/src/{client,server}/index.ts` + `NodeRegistry` (`packages/nodes/src/registry/index.ts:5-29`) | `apps/api/src/engine/node.registry.ts:14-193`; keep `apps/web/registry/nodeRegistry.ts` as *presentation metadata only* and re-key it to `NODE_KIND` | Runtime executes through `@neuron/nodes/server`; API registry has no live importer. Web registry owns icons/validation, a different responsibility — do not merge it into the execution registry. |
| Execution orchestration | One application use-case `ExecuteWorkflow` owning create→run→record | Inline blocks in `workflow.controllers.ts:316-369` and `deploy.workflow.controller.ts:173-282` | Preserve both HTTP behaviors via two thin response projectors: 202 fire-and-forget vs awaited terminal response. |
| Legacy engine files | — | Delete dead files after CI typecheck exists: `node-registrys/*`, `node.runtime.ts`, `resolveTemplate.ts`, `engine/runtime/branching.ts`, `engine/node.registry.ts`, `engine/services/executionLogger.ts` (verify no importers first) | `AGENTS.md:845-849` forbids dead code; removal is behavior-neutral because no live importers exist. |
| Auth in controllers | Middleware-derived `req.user` (`execution.controller.ts:15-21`) | Direct Supabase check in `deploy.workflow.controller.ts:18-40` — replace with the public-deployment API-key check as a dedicated use-case | Two auth paths for the same resource is a competing representation; T-004 must sign off on the public-deployment contract first. |

### D6 — Abstraction guidelines (concrete, anti-over-engineering rules)

1. Create an interface only when (a) a domain module must reach an effect (clock, I/O, randomness, network, persistence), or (b) two concrete implementations demonstrably exist today. No interface for a single in-process class with no boundary.
2. Ports are one-method (or one cohesive command group) and named for the capability (`WorkflowEventSink`, not `IEventManager`). `IVaultResolver.resolve` (`vault.ts:1-3`) is the size template.
3. Ports are owned by the consumer (domain/application), declared in `@neuron/shared`, and implemented at the edge. Never export a Drizzle row type through a port.
4. No generic `Repository<T>` base, no service locator, no ambient `globalThis` registry. Existing global-var usage in `@neuron/db` must be contained behind the adapter, not abstracted.
5. A mapper exists only where two representations demonstrably differ (DB row ↔ domain graph); it is a pure function in `lib/graphMappers.ts`, unit-testable with no I/O.
6. Prefer a concrete function over a class when there is no lifecycle/state. `Runtime` remains a class because it owns per-execution mutable traversal state (`runtime.ts:22-35`); reducers stay pure functions.
7. Do not add a package, layer, or indirection that cannot name the boundary it protects. No barrel-only package.
8. Every new port gets at least one in-memory test double and one contract test at the adapter. No test → no abstraction merged.

### D7 — Testability as a boundary driver

Order tests by boundary, not by coverage percentage:
1. Pure domain: `branching.ts`, `executionPolicy.ts:4-21`, `utils/index.ts:27-168`, `graphMappers.ts` — no I/O, no React, no DB.
2. Engine with fakes: `Runtime` constructed with in-memory `IVaultResolver` + `WorkflowVariableSource` + `WorkflowEventSink`; assert emitted domain events and traversal order. This becomes possible only after D3.
3. Application use-cases with fake repositories: assert status updates and the two response projections.
4. Adapter contract tests: realtime sink preserves event channel/string values; DB variable source returns the same shape as `getGlobalVariables` (`global.variables.repository.ts:6`).
5. Provider slice tests via reducers extracted from the provider, no DOM required.
6. CI gate: add `pnpm check-types`, `pnpm lint`, `pnpm test` to `.github/workflows/ci.yml` after scripts are repaired; fix pnpm version drift (`ci.yml:22` vs `package.json:21`) in the same change.

## Alternatives considered

### A. Minimal "ports only inside `@neuron/runtime`" (rejected)
Inject the three collaborators into `Runtime` but leave controllers calling repositories and leave the provider intact.
- Pros: smallest diff; removes the worst backward edge; low regression risk.
- Cons: keeps duplicated orchestration and god-module; no place to unit-test validation/policy; the same create→execute→record logic remains in two controllers with divergent behavior; does not satisfy the initiative goal in `.agents/ledger.yaml:2-3`.
- Verdict: necessary first step (Migration 1), insufficient as a target.

### B. Full layered architecture with a new `@neuron/ports` package and CQRS split (rejected)
Create a standalone ports package, command/query buses, and a separate application package.
- Pros: theoretically cleanest dependency inversion; strong compile-time enforcement.
- Cons: adds two packages and a bus abstraction with no current second implementation to justify them (`D6.1`, `D6.7`); multiplies build graph and migration steps in a repo with zero tests and non-functional typecheck; violates "do not introduce speculative packages".
- Verdict: over-engineering for the observed problem.

### C. Recommended — layered application service using existing packages
Add a thin `application` folder inside `apps/api`, place ports in `@neuron/shared`, keep adapters where they are, and extract provider hooks in place.
- Pros: fixes all four hotspots with no new packages; preserves public HTTP and realtime contracts; each step independently testable and reversible; uses `IVaultResolver` that already exists.
- Cons: `apps/api/src/application` is a new folder (requires this ADR and a migration plan — satisfied here); `@neuron/shared` remains somewhat broad until a later split; discipline must be enforced by review until CI rules land.
- Verdict: **recommended**.

### Consolidation alternative considered: keep both engines and add an adapter shim (rejected)
Preserve the legacy API registry/branching/transform copies behind a facade "for compatibility".
- Pros: zero deletion risk.
- Cons: keeps three competing node vocabularies (`"condition"` vs `NODE_KIND.LOGIC_CONDITION`), preserves genuine divergence (no failure routing in legacy branching), and contradicts "one authoritative implementation" (`AGENTS.md:268-277`, `AGENTS.md:845-849`). Evidence shows no live importer, so the shim would protect nothing.

## Consequences

**Positive**
- Domain engine becomes pure and unit-testable with in-memory fakes; no DB/Supabase in tests.
- Every boundary crossed has an explicit owner and direction; web no longer coupled to persistence types.
- One authoritative orchestration with two response projections; one authoritative node registry and branching algorithm.
- Provider becomes ~10 cohesive modules with single state owners.

**Negative / new obligations**
- A new `apps/api/src/application` folder and port declarations must be maintained.
- Row→domain mapping becomes an explicit required step; forgetting it will break node `position` handling.
- The two editor-action enums must be kept value-identical until the final deletion step; a wire-contract test is mandatory.
- T-004 security findings may require reworking the public-deployment auth use-case before consolidation.

**Neutral**
- HTTP status codes, response bodies, realtime channel names, and event strings are unchanged by design.

## Boundary and dependency impact

- **Removed:** `runtime → db` (4 import sites), `runtime → editor enum` (1 import site), `controllers → db` (5 controller files), `web → db` (15 files, staged).
- **Added:** `application → domain`, `application → ports`, `adapters → ports`, `composition root → everything`, `runtime → ports`.
- **Changed:** `db` remains an adapter; its realtime broadcaster (`packages/db/src/realtime/workflowBroadcast.ts`) should move to an adapter module in `apps/api` in a later step, with the channel/payload contract unchanged.
- **Public surface:** no change to HTTP routes (`apps/api/src/index.ts:33-41`), `useWorkflowEditor()` hook, or context value shape in step 1. Removal of `packages/shared`'s editor enum and of unused context fields happens only in the final cleanup step.

## Must-not-break contracts and invariants

1. HTTP routes and mounts: `/test`, `/api/v1/workflows`, `/api/v1/workspaces`, `/api/v1/auth`, `/api/v1/secrets`, `/api/v1/execute/workflow`, `/api/v1/executions` (`apps/api/src/index.ts:33-41`).
2. Response semantics: interactive execute returns `202 { message: "Execution started", workflowId }` (`workflow.controllers.ts:368`); deployed execute returns the terminal response's status/headers/body or `{success:true,...}` fallback (`deploy.workflow.controller.ts:246-256`).
3. Execution status transitions: success/failed records updated with the same result shapes (`workflow.controllers.ts:349-365`, `deploy.workflow.controller.ts:238-265`).
4. Realtime wire contract: channel `workflow_<runId>`, events `workflow_action` / `workflow_runtime_action`, payload `{ type, ...payload }` (`workflowBroadcast.ts:3-24`, `useWorkflowRealtime.tsx:16-30`).
5. Event string values `NODE_EXECUTION_START`, `NODE_EXECUTION_SUCCESS`, `NODE_EXECUTION_ERROR` (`shared/constants:17-19`, `web/constants:157-159`).
6. Webhook trigger data injection: `config.webhookData = { body, query, headers }` (`apps/api/src/engine/execution.ts:19-27`) must survive the engine wrapper removal.
7. Terminal response shape `__isTerminal/status/headers/body` (`packages/runtime/src/execution/runtime.ts:157-163`; produced at `apps/api/src/engine/node.registry.ts:183-191` and in `@neuron/node-respond`) and its mapping in deployed execution.
8. Node graph translation: `positionX/Y` ↔ `position:{x,y}`, config/type/id, edge handles (`WorkflowEditorProvider.tsx:306-314`).
9. Local-first save behavior: debounce 3000 ms, retry schedule `[1000,3000,7000,15000,30000]`, `synced` flag, pending-save coalescing, offline toast (`WorkflowEditorProvider.tsx:135,332-399,542-568`).
10. Dexie draft identity keyed by `workflowId` (`:172,:348,:546-552`).
11. Deployed-workflow private API key: `x-neuron-key` header or `api_key` query, timing-safe comparison (`:189-215`). Security-sensitive; T-004 sign-off required for any change.
12. Process-level error behavior (`apps/api/src/index.ts:44-74`) stays until T-004 rules otherwise.
13. Public context shape of `useWorkflowEditor()` and all 61 consumers (`hooks/workflow/useWorkflowEditor.tsx:3-8`).

## Migration plan

Steps are ordered; each keeps the system working and is independently revertible. `Lease` = proposed exclusive write scope for the implementation task.

1. **Safety net (no behavior change).** Add functioning `check-types`, `lint`, and `test` scripts and wire them into CI; fix pnpm version drift. Establish the characterization tests from D7.1 for `branching`, `executionPolicy`, `resolveTemplate`, and the provider reducer behavior. *Lease: `package.json`, `turbo.json`, `.github/**, new test files adjacent to tested boundaries.* **Blocker for steps 4-8.**
2. **Runtime ports (D3).** Add `WorkflowVariableSource` and `WorkflowEventSink` to `@neuron/shared`; extend `ExecuteWorkflowType` with three optional collaborators defaulting to today's concrete adapters; switch `VaultService` field to `IVaultResolver`. Keep defaults so no caller changes. *Lease: `packages/runtime/**, packages/shared/src/ports/**, apps/api/src/adapters/**`.*
3. **Realtime event adapter.** Move the editor-event mapping into `apps/api/src/adapters/WorkflowRealtimeEventSink.ts`, preserving channel/payload/string values (invariant 4-5). Add wire-contract test. *Lease: `apps/api/src/adapters/**, new adapter tests.* Can run **in parallel with step 2** if the port type is agreed first.
4. **Application layer for execution.** Create `ExecuteWorkflow` use-case; move create→execute→record out of both controllers behind two response projectors (invariants 2-3). Delete the inline `apps/api/src/engine/execution.ts` wrapper only after webhook injection (invariant 6) is inside the use-case. *Lease: `apps/api/src/application/**, the two controllers, apps/api/src/engine/execution.ts.* Depends on 1-3.
5. **Dedicated deployment auth use-case.** Extract the API-key check (`deploy.workflow.controller.ts:187-216`) behind a use-case; temporarily keep the direct Supabase call behind an adapter if T-004 requires zero auth change. *Lease: `apps/api/src/application/**, apps/api/src/controllers/deploy.workflow.controller.ts.* **Depends on T-004 sign-off.**
6. **Provider extraction (D4), phase 1 — pure code.** Extract the three reducers and mappers verbatim into new files; provider re-exports them. No consumer changes. *Lease: `apps/web/state/**, apps/web/lib/graphMappers.ts, apps/web/providers/WorkflowEditorProvider.tsx.* **Parallel with steps 2-5** (disjoint lease).
7. **Provider extraction, phase 2 — hooks.** Extract draft/sync/commands/logs/selection hooks; keep the context value shape identical. Delete dead duplicates (`runtimeState.nodeStatus`, `editorState.runtime.executions`, local `logs`) only after consumer grep is clean. *Lease: same as step 6 + `apps/web/hooks/workflow/**.* Depends on 6.
8. **Consolidation.** Delete dead legacy engine files and the duplicate transform/branching/registry copies; re-key the web presentation registry to `NODE_KIND`. *Lease: `apps/api/src/engine/**, packages/nodes/**, apps/web/registry/**.* Depends on 4 and 7.
9. **Web→db decoupling.** Convert all 15 imports to `import type`, then migrate types to `@neuron/shared` contracts and delete the dependency from `apps/web/package.json:37`. *Lease: `apps/web/**, apps/web/package.json.* Depends on 8.
10. **Final cleanup.** Remove the unused shared editor enum (`packages/shared/src/constants/index.ts:1-24`), move the realtime broadcaster out of `@neuron/db`, add CI boundary-lint rules from D2. Depends on 3, 8, 9.

**Parallelism summary:** (2+3) can overlap after the port signature is fixed; (6) is fully parallel with all API work; (4) and (5) share the application folder and should be sequential or split by file lease; (8), (9), (10) are sequential. T-004 (security) and the verification explore task can run concurrently with this ADR because this agent writes only under `.agents/decisions/**`.

**Rollback:** every step is a revert of one commit with no schema migration. The only wire-visible change is step 3; its contract test is the rollback trigger. Steps 4/5 keep the old controller code until the new use-case tests pass.

## Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Row→domain mapping omitted when swapping DB types for shared types | Medium | High (node positions/edges break) | Explicit pure mapper + characterization test (D7.1); invariant 8 | implementation agent |
| Event string/channel drift between the two enums | Medium | High (live execution visuals break) | Wire-contract test on both enums and broadcast adapter; delete only in step 10 | implementation agent |
| `VaultService` cache quirk copied into the new port adapter | High | Medium (secret behavior changes) | Pin current behavior in a test before extraction; decide fix explicitly with security | implementation + T-004 |
| Typecheck/lint still broken when refactoring starts | High | High (silent regressions) | Step 1 is a hard gate before step 4 | coordinator |
| T-004 requires auth changes that reshape the deployment use-case | Medium | High | Step 5 depends on T-004; steps 1-4 and 6-7 are unaffected | coordinator |
| Accidental deletion of a "dead" engine file used dynamically | Low | Medium | Grep all importers again at step 8; delete in one revertible commit | implementation agent |
| Provider split changes render timing / debounce behavior | Medium | Medium | Preserve effect dependency arrays verbatim in phase 1; test reducer + draft/sync hooks | implementation agent |
| Realtime payload remains unvalidated | High | Medium | Type the dispatchers in step 6/7 and validate payloads in the realtime adapter; T-004 scope | T-004 |

## Verification

- Architecture property: a scripted import check asserts zero `@neuron/db` imports in `packages/runtime/**` and zero `apps/web/** → @neuron/db` after steps 2 and 9; zero `controllers → @neuron/db` after step 4.
- Behavior: characterization tests for invariants 1-11 pass before and after each step.
- Build: `pnpm build` (existing CI command) plus newly added `pnpm check-types`, `pnpm lint`, `pnpm test`.
- Provider: reducer tests and hook tests run without a browser; context shape is asserted by a compile-time type test.
- No test currently exists; "compiles" alone is explicitly insufficient (`AGENTS.md:412-421`).

## Open questions

- Should `WorkflowVariableSource` live in `@neuron/shared/ports` or be folded into a broader `ExecutionContextSource` once logging/metrics ports are added? Affects step 2 file layout.
- Is the `VaultService.resolve` return/cache inconsistency (`:23-26`) a bug to fix or behavior to preserve? Requires T-004 decision before step 2 adapter is written.
- Are deployment node JSON rows guaranteed to carry the same shape as workflow graph rows? Runtime only reads `id/type/config` and edge handles, but invariant 8 must be confirmed with a fixture before the type swap.
- Does any external consumer depend on `@neuron/shared`'s `WorkflowEditorActionType` export? Grep shows none in-repo; confirm no published SDK consumer before step 10.
- Should `apps/web/registry/nodeRegistry.ts` move into `@neuron/nodes/client` as presentation metadata, or stay app-local? Kept local here to avoid speculative packaging.

## Report metadata

- task id: T-003
- role: architect
- status: needs_review (recommendation complete; blocked on P-001 instruction gap, missing test gate, and T-004 security input before implementation)
- scope: repository-wide read-only; decision file `.agents/decisions/T-003-architecture.md` only
- files changed: `.agents/decisions/T-003-architecture.md` (this file) only
- commit status: no commit made; working tree unchanged except permitted ADR path
- checks run: `git status --short --branch` (branch `main`, only `?? .agents/` pre-existing), `git log --oneline -5`, full reads and greps cited above. Build/lint/typecheck were **not** executed because the lease forbids mutating commands and Turbo/Next may write caches; conclusions about validation scripts are from manifest/CI inspection.
