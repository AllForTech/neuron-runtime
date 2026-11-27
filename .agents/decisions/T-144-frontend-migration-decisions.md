# 0144 — Frontend migration decisions: selection, sheets, command lifetime, and provider topology

- Status: **accepted** — architect recommendation is complete for all six blocking decisions. D1, D2, D3 and D6 are behavior-neutral. D4 and D5 were explicitly approved by the user via D-07 and D-08 in `.agents/decisions/user-decisions.md`; T-123 may implement all six decisions.
- Date: 2026-11-27
- Owners: architect
- Related tasks: T-120, T-121, T-122, T-123, T-124, T-141
- Lease: `.agents/decisions/T-144-frontend-migration-decisions.md` only. No source, test, config or manifest edits; no new dependencies; no suppressions; no commits.

## Context

### Authority and constraints

- `AGENTS.md:214-223` requires architecture before code; `:225-241` requires single responsibility; `:244-253` forbids hidden state mutation; `:412-421` says compilation is insufficient verification.
- `context/NEURON_ENGINE.md` and `context/DESIGN_RULES.md` were read in full. The former sets runtime semantics but no editor-state boundary; the latter is a visual-token specification and imposes no state-ownership constraint.
- `user-decisions.md:12` (D-05) replaces the editor React context with Zustand and **deletes** it; HTTP/realtime contracts stay frozen. `user-decisions.md:8` (D-01) freezes wire contracts, not the internal context shape.
- `.agents/ownership.yaml:19-21` assigns `frontend_state` to `coder`; `.agents/ledger.yaml:796-805` grants this task an exclusive lease on this ADR path only.
- T-121 is accepted (`ledger.yaml:526-538`): four stores, pure transitions, selectors, commands, bootstrap, exact `zustand@5.0.12`. Residual risks explicitly carried forward: object selectors need `useShallow` (`:537`; `.agents/reports/T-121-architecture-review.md:20`).
- T-141 enumerated the six blockers (`.agents/reports/T-141.md:27-33`) and T-120 reconciled 27 consumers / 37 dispatch sites (`.agents/reports/T-120.md:13-14,33-65`). This ADR verifies each claim against source rather than relying on the reports alone.
- T-007 ADR remains in force except where refined here: `:72` said `uiStore` owns `selectedNode` and dead booleans are deleted; `:86` requires one `useReactFlowView` hook; `:92-94` puts side effects in commands/adapters/bootstrap and forbids `getState()` in components; `:132` freezes wire contracts; `:161` requires CI gates.
- Context7 verification (`/pmndrs/zustand`, v5.0.12 migration guide): selectors returning new object/array references "may cause infinite loops in v5"; `useShallow` from `zustand/react/shallow` stabilizes them, and selector functions themselves must be referentially stable.

### Observed structure (source evidence)

**Store surfaces**
- `uiStore.ts:18-45` owns `activeLeftPanel`, `activeRightPanel`, both histories, `selectedNodeId`, `selectedHandle`, `isDeployWorkflowDialogOpen` and stable actions; `types.ts:80-84` has no `selectedNode` object field.
- `graphStore.ts:29-74` is the single owner of graph nodes/edges, metadata, global variables, deployment and `isDirty`.
- `runtimeStore.ts:28-68` owns visuals, executions and logs; `sessionStore.ts:21-55` owns `runId`, bootstrap status and in-flight flags.
- `selectors.ts:23-61` exports stable module-level selectors; `:75-128` derives React Flow nodes/edges (data is config plus `label: node.type` at `:104-110`).
- `transitions/ui.ts:93-134` validates dispatch payloads with `isPanelId`; `constants/editor-panel.ts:156-164` lists `PANEL_IDS` **without** `graph-navigator`, although `:14` and `:144-153` include it in `PanelId` and `PANEL_POSITION_MAP`.

**Shim and composition**
- `providers/WorkflowEditorProvider.tsx:69-119` publishes the 45-field legacy type; `:134-141` obtains commands from `WorkflowSessionContext` and calls `useReactFlow()`; `:159-173` uses `useShallow` for object/array selectors; `:194-205` holds seven local UI booleans; `:217-223` mirrors `selectedNode` into `selectNodeAction`; `:249-296` performs template insertion with imperative `addNodes/addEdges`; `:298-330` wraps commands.
- `stores/workflow/bootstrap/WorkflowSessionBootstrap.tsx:46-51,63-93` creates commands from injected ports and wires realtime/draft/load; `:128-133` publishes commands through `WorkflowSessionContext`. `bootstrap/WorkflowSessionContext.ts:6-20` is explicitly marked TEMPORARY.
- `app/(editor)/Provider.tsx:12-30` owns the exact error policy (log-only contexts `loadGraph`, `loadDeployment`, `getExecutionLogs`; save toast; generic toast); `:32-45` nests `ReactFlowProvider → NodeOutputProvider → WorkflowSessionBootstrap → WorkflowEditorProvider → ValidationProvider`.
- `app/(editor)/editor/[workflowId]/page.tsx:7-14` adds a **second** `ReactFlowProvider` around `<Editor />`.
- `hooks/workflow/useWorkflowEditor.tsx:3-10` is only a `useContext` wrapper.

**Consumer usage verified**
- `selectedNode` is read as `.id`, `.data`, `.type` and passed as a whole node: `Panel/NodeConfigPanel.tsx:24-96,102-193`, `config/renderer/fields/TemplateField.tsx:15-24`, `KeyValueField.tsx:19-34`, `Panel/templates/NodeTemplatePanel.tsx:17,75`, `Panel/NodesInspector.tsx:16-43`, `nodes/DynamicNode.tsx:64,101`, `nodes/TriggerNode.tsx:39,64`, `Editor.tsx:70-91,198-202`, `menu/EditorLeftMenu.tsx:18`, `nodes/NodeHandle.tsx:42`.
- `nodePropsToReactflowNode` (`lib/utils.ts:109-117`) supplies `id/type/position/data`; `toReactFlowNode` (`lib/utils.ts:85-95`) supplies `data: node.config`. Both are plain structural views, not React Flow internals.
- Four sheet setters are called but their values are never read: `setSheetOpen` (`nodes/DynamicNode.tsx:65,102`, `nodes/TriggerNode.tsx:40,65`), `setOpenConfigSheet` (`nodes/HttpRequestNode.tsx:52`), `setIsGlobalVariableSheetOpen` (`UpstreamNodePicker.tsx:73`). Three further booleans (`isEditorPanelOpen`, `isExecutionsSheetOpen`, `isWorkflowInspectorOpen`) are neither read nor set outside the shim (`providers/WorkflowEditorProvider.tsx:198-205,347-369`). T-120 independently lists these as never destructured (`.agents/reports/T-120.md:65`).
- `EditorLeftMenu.tsx:27` dispatches `OPEN_PANEL` with `graph-navigator`; the registry defines it (`constants/panel-registry.tsx:76-81`) and `Sidebar.tsx:21-49` would render it, but `isPanelId` rejects it, so the action is a **no-op**.
- `Editor.tsx:50-51,93-102` keeps React Flow's local `useNodesState/useEdgesState` and syncs from derived `rfNodes/rfEdges` after 200 ms; `:109-141` pins 100/200 ms debounces. T-141 warns to preserve this dual state (`.agents/reports/T-141.md:36`).
- Tests pin current composition only: `apps/web/tests/workflow-editor-shim.test.tsx:72-117,153-207` and `apps/web/tests/workflow-session-regressions.test.tsx:39-100,177-309`. Neither asserts a sheet flag or graph-navigator behavior.

## Decision

### D1 — Selection ownership: `selectedNodeId` in `uiStore`, node object derived, never stored

**Decision.** `uiStore` remains the sole owner of selection **identity** (`selectedNodeId`, already at `types.ts:81` and `uiStore.ts:24,40`). `graphStore` remains the sole owner of node objects. Add a pure `selectSelectedNodeView(graph, selectedNodeId)` to `selectors.ts` returning a plain structural view `{ id, type, position, data }` where `data` matches `deriveReactFlowView` (`config` plus `label: type`, `selectors.ts:108`). Components use `useStore(uiStore, s => s.selectNode)` for writes and the new selector for reads. `setSelectedNode(node)` call sites become `selectNode(node?.id ?? null)`; `handleSelectTemplate(template, connectingNode?)` takes a domain `{ id, position }` source (or just the id and resolves the node), not a React Flow `Node`.

**Rationale.** Consumers only use four structural fields; storing a React Flow `Node` object would duplicate graph data, import a framework type into state, and let the stored snapshot go stale after config edits. Identity plus derivation gives one authoritative node representation and keeps `rfNodes` selection (`selectors.ts:109`) consistent with the same id. This refines T-007 `:72` from "`uiStore` owns `selectedNode`" to "`uiStore` owns `selectedNodeId`; the object is a derived view."

**Rejected alternatives.**
- *Add `selectedNode: Node | null` to `uiStore`*: second node representation + framework leakage; stale snapshots.
- *Keep per-component local `selectedNode` state*: recreates scattered state the migration is intended to delete.
- *Store the whole graph node in `uiStore`*: duplicates `graphStore` and introduces two write paths for config.

**Compatibility.** Internal context shape is unfrozen (D-05); wire contracts untouched. `selectedHandle` stays in `uiStore`. `Editor.tsx:79-80`'s null-then-node sequence is preserved as two `selectNode` calls. The 200 ms React Flow sync and its local arrays are unchanged.

**Test impact.** Add a pure selector test that the derived view matches `deriveReactFlowView(...).nodes` for the selected id (including `label`) and is `null` for missing ids; keep `ui.transitions.test.ts:40-48` as the identity-writer contract. Shader-independent: no DOM needed.

**User-visible behavior.** **No intended change.** The derived view uses the same data shape as the canvas-derived node, so `NodeConfigPanel` initial values and selection highlighting remain equivalent. A latent stale-snapshot bug (stored object not following graph edits) is removed as a side effect; flag it in review rather than treating it as a new feature.

### D2 — Sheet/UI booleans: delete all seven; do not create store flags and do not map to panels in T-123

**Decision.** Delete `isSheetOpen`, `openConfigSheet`, `sheetOpen`, `isGlobalVariableSheetOpen`, `isEditorPanelOpen`, `isExecutionsSheetOpen`, `isWorkflowInspectorOpen` and all their setters from the shim value (`providers/WorkflowEditorProvider.tsx:79-100,198-205,347-369`). Remove the four write-only consumer calls (`DynamicNode.tsx:65,102`, `TriggerNode.tsx:40,65`, `HttpRequestNode.tsx:52`, `UpstreamNodePicker.tsx:73`) in their owning batches. Keep the paired `setSelectedNode` calls (D1) and keep `uiStore.openPanel/closePanel/setActivePanel` as the only panel owners.

**Rationale.** No consumer reads any of these values; the four setters are observable no-ops and the other three are entirely dead. Adding them to `uiStore` would create a competing representation of panel state (`constants/editor-panel.ts:31-50`) with no reader. Mapping them to panels is a product decision, not a migration necessity.

**Rejected alternatives.**
- *Add four booleans to `uiStore`*: permanent dead state, two owners for "is a sheet open".
- *Map `setSheetOpen` / `setOpenConfigSheet` / `setIsGlobalVariableSheetOpen` to `openPanel(...)` during T-123*: would newly open the config/variables panels from node context menus and the UpstreamNodePicker "New Variable" button — a user-visible feature change bundled into a refactor.
- *Leave local state in migrated components*: preserves dead writes and defeats the shim deletion.

**Compatibility.** D-05 explicitly unfreezes/deletes the internal context; T-007 `:72,160` already directs dead booleans to deletion. External HTTP/realtime contracts unaffected. No evidence of out-of-repo consumers was found; T-007 `:192` recorded this as an open question, so treat external reliance as **unverified** and re-check at T-124 gate time.

**Test impact.** Existing shim tests do not assert these flags (`workflow-editor-shim.test.tsx:126-207`); no assertion weakening is needed. Add a T-124 CI grep for the seven symbols plus a store test asserting `createInitialUIState()` exposes no sheet fields (`transitions/ui.ts:17-24`). If a future UX change wants these panels to open, add a new task with its own behavior-changing test first.

**User-visible behavior.** **No change.** All removed writes are currently unobservable; removing them cannot alter rendered UI.

### D3 — Command lifetime: one stateless module-level command API, exported functions, no React context and no fifth store

**Decision.** Keep `createWorkflowCommands` (`commands/workflowCommands.ts:57-236`) as the pure injectable factory and its `WorkflowCommandDeps` port (`:46-55`) as the unit-test seam. Add one narrow file, `commands/workflowCommandApi.ts`, that binds **one** instance at module scope to the existing store singletons, `@neuron/client` clients, `defaultGetAccessToken` (moved from `bootstrap/WorkflowSessionBootstrap.tsx:46-51`, not duplicated), the draft adapter and a dedicated error-policy module; it exports stable named functions (`loadGraph`, `saveGraph`, `runWorkflow`, `deployWorkflow`, `deleteDeployment`, `getExecutionLogs`). Move `(editor)/Provider.tsx:12-30`'s `reportError` policy byte-for-byte into `commands/workflowErrorReporting.ts` so log-only/save/generic toasts stay identical and no `onError` prop is needed. Migrated consumers import those named functions explicitly and pass the `workflowId` selected from `graphStore` (single route id set at `WorkflowSessionBootstrap.tsx:95-98`).

Until the last shim consumer migrates, `WorkflowSessionBootstrap` publishes **that same module instance** into the temporary `WorkflowSessionContext` (`bootstrap/WorkflowSessionContext.ts:6-20`; current shim reader at `WorkflowEditorProvider.tsx:134-140`) so there is never a second production command instance. `WorkflowSessionContext` and its export (`bootstrap/index.ts:2-5`) are deleted in T-124 as already planned. `saveWorkflowGraph` and `onRunComplete` have no consumers (`.agents/reports/T-120.md:65`) and are dropped from the public surface rather than re-exported.

**Rationale.** Commands are stateless orchestration, not state: they hold no data that needs a store or re-render. Direct named imports are explicit dependencies (imports), avoiding both a service locator and a React context; the factory preserves injected fake clients for unit tests. One module instance matches the real app's single editor session per route and survives deletion of the shim.

**Rejected alternatives.**
- *A permanent `WorkflowCommandsContext`*: violates D-05's deletion of editor context and keeps consumers coupled to provider placement.
- *A mutable module registry with `install/get/clear`*: a service locator with hidden global mutation, explicit exception-free rule in `AGENTS.md:244-253`; unnecessary because production ports are already module singletons.
- *A fifth "commands store"*: reactive state for non-reactive functions; introduces a null-on-first-render state and duplicates the accepted four-store boundary.
- *Move command bodies into `graphStore`/`sessionStore`*: puts I/O and toast policy inside state owners, reversing the dependency direction established by T-007 `:88-94`.

**Compatibility.** No HTTP route, response shape, realtime channel/event string (`adapters/workflowRealtime.ts:50-68`), retry schedule or debounce (`commands/workflowSync.ts:22-56,111-121`) changes. Error policy is relocated, not rewritten: the exact contexts and messages from `(editor)/Provider.tsx:12-30` move with it. Composition tests already mock `@neuron/client`, `sonner`, Supabase and Dexie (`workflow-session-regressions.test.tsx:39-100`), so a module-bound default instance remains testable without prop injection; `workflow-editor-shim.test.tsx:72-95` keeps its own injected instance until the shim is deleted.

**Test impact.** Keep `commands.test.ts` and `workflow-session-regressions.test.tsx:177-309` green without weakening assertions; add a test that the exported API delegates to `createWorkflowCommands` with the pinned error-policy contexts (log-only three, save, generic) and that no toast text changed. Update only import paths in tests that reference the moved error policy. No `getState()`/`setState()` appears in components (T-007 `:94,161`).

**User-visible behavior.** **No intended change** if the error policy is moved byte-for-byte. Risk: a mis-copied context/message would change toasts; the pinned test above is mandatory.

### D4 — `ReactFlowProvider` topology: exactly one provider at `(editor)/Provider.tsx`

**Decision.** Keep the outer `ReactFlowProvider` in `app/(editor)/Provider.tsx:36` as the single owner of the React Flow instance (it must wrap `WorkflowSessionBootstrap`/shim because `WorkflowEditorProvider.tsx:141` calls `useReactFlow()`). Delete the duplicate provider in `app/(editor)/editor/[workflowId]/page.tsx:4,10-12` so `<Editor />` is a descendant of the same instance. In the same batch, remove imperative `addNodes/addEdges` from `handleSelectTemplate` (`WorkflowEditorProvider.tsx:141,265-279`) and use the existing pure `insertTemplateNode` helper (`commands/graphCommands.ts:87-129`) to write nodes/edges to `graphStore`; the canvas continues to be driven by `deriveReactFlowView` plus the 200 ms sync (`Editor.tsx:93-102`). `NodesInspector.tsx:17,31-33`'s `setNodes` and any `fitNode`/`fitView` call then target the visible canvas.

**Rationale.** Two providers create two stores: the shim's `fitView/addNodes/addEdges` currently act on a detached instance while the visible canvas uses the inner one. One provider makes `useReactFlow()` refer to one instance; removing the imperative mirror at the same time prevents a transient duplicate node before the 200 ms store sync. This preserves "one owner of graph content" (`graphStore`) and avoids a new Zustand mirror of React Flow view state.

**Rejected alternatives.**
- *Keep both providers*: permanently splits imperative and rendered canvas state; `fitNode` stays broken and template insertion writes to an invisible instance.
- *Keep only the page-level provider and move all `useReactFlow()` calls into canvas descendants*: also fixes the split, but requires moving `handleSelectTemplate`/`fitNode` out of the composition edge and re-plumbing props; larger change with the same end state.
- *Move React Flow's local `graphNodes/graphEdges` into Zustand*: duplicates `deriveReactFlowView` and changes the pinned 200 ms dual-state behavior (`.agents/reports/T-141.md:36`); explicitly out of scope.

**Compatibility.** Frozen wire contracts unaffected. Provider nesting order (`layout.tsx:9-13`) stays; only the duplicate wrapper goes. Debounce timings stay at 100/200 ms (`Editor.tsx:109-141`) and 3000 ms autosave (`commands/workflowCommands.ts:133-135`).

**Test impact.** Add a DOM/composition regression asserting exactly one `ReactFlowProvider` in the editor subtree (source-level or render spy), that `useReactFlow().fitView` is called on the provider shared with `<Editor />`, and that template insertion produces one store node/edge and no direct `addNodes` call. Existing shim tests mock `ReactFlowProvider` as a pass-through (`workflow-editor-shim.test.tsx:7-14`), so they need no behavior change.

**User-visible behavior.** **Change:** `fitNode`/`fitView` from Graph Navigator will start centering the actual canvas (currently it targets a detached instance), and template insertion will no longer make an invisible duplicate write. This is an intended bug fix but is visible; **requires explicit user approval before T-123**.

### D5 — `graph-navigator`: enable it by fixing `PANEL_IDS`, not by bypassing validation

**Decision.** Add `'graph-navigator'` to `PANEL_IDS` (`constants/editor-panel.ts:156-164`) and migrate `EditorLeftMenu.tsx:27` to `uiStore.openPanel('graph-navigator')` (or the equivalent validated `editorUIDispatch` path). Both paths then agree because `editorUIReducer` already maps the id to the left panel (`constants/editor-panel.ts:144-153`) and `panelRegistry` already renders `NodesInspector` (`constants/panel-registry.tsx:76-81`, `Sidebar.tsx:21-49`). Do **not** keep a special case that bypasses `isPanelId` (`transitions/ui.ts:93-102`), and do not invent a second panel representation.

**Rationale.** The current no-op is caused by one incomplete list, not by missing UI. Fixing the list keeps validation and registry consistent; bypassing validation would leave two competing authorities for valid panel ids.

**Rejected alternatives.**
- *Preserve the no-op* by migrating the call verbatim without fixing `PANEL_IDS`: behavior-preserving, but leaves a dead "Library" button and an internal inconsistency; not recommended.
- *Call `uiStore.openPanel('graph-navigator')` while leaving `PANEL_IDS` unchanged*: works only because the action path skips validation; creates divergent behavior between dispatch and action and a future trap.
- *Add a separate navigator flag to `uiStore`*: duplicates `activeLeftPanel`.

**Compatibility.** No wire-contract impact. The panel id, label, registry component and left position remain unchanged. Long-term unification of `PANEL_IDS`, `PanelId`, `PANEL_POSITION_MAP` and `panelRegistry` is a separate ADR; this decision only reconciles the missing entry.

**Test impact.** Add to `ui.transitions.test.ts:50-62` a case asserting both `uiReducer(initial, {type:'OPEN_PANEL', panelId:'graph-navigator'})` and `openPanel(state, 'graph-navigator')` set `activeLeftPanel` and leave history semantics unchanged; add a component test that the Library button opens the registered panel.

**User-visible behavior.** **Change:** the Library button will open the Graph Navigator panel instead of doing nothing. **Requires explicit user approval before T-123.** If approval is withheld, T-123 must record the deviation and preserve the no-op until a separate approved task.

### D6 — Selector stability: module-level selectors, `useShallow` at object/array call sites, `useMemo` for derived views

**Decision.**
1. Single-field reads use stable inline selectors returning primitives or stable store actions (`useStore(uiStore, s => s.openPanel)`).
2. Multi-field object/array reads use the exported pure selectors from `selectors.ts:55-73` and `shim/legacyContext.ts:69-115`, wrapped with `useShallow` **at every call site**: `useStore(store, useShallow(selectUiFlags))`. No inline `(s) => ({ ... })` without `useShallow`.
3. Parameterized selectors (`selectNodeStatus(id)`, `selectNodeError(id)`, `selectNodeOutput(id)` at `selectors.ts:23-36`) are instantiated with `useMemo(() => selectNodeStatus(id), [id])` before `useStore`, so the selector reference is stable.
4. `deriveReactFlowView` (`selectors.ts:99-128`) creates fresh nested node/edge objects; expose it through one `useReactFlowView()` hook that memoizes with `useMemo` keyed on `graph`, `selectedNodeId` and `activeEdges` (T-007 `:86`). `useShallow` alone is insufficient for nested objects; `selectRuntimeLogs`/`selectExecutions` (`:41-45`) may use `useShallow` because their elements are stable records.
5. Keep imperative reads in commands/adapters/bootstrap only; no `getState()/setState()` in components (T-007 `:94,161`).

**Rationale.** Zustand v5 uses `useSyncExternalStore` with a memoized selector; a selector that returns a fresh reference can loop, and a fresh selector function defeats memoization. The shim already demonstrates the correct pattern (`WorkflowEditorProvider.tsx:143-173`); T-121 review requires carrying it into T-123.

**Rejected alternatives.**
- *`createWithEqualityFn` / v4 equality behavior*: reintroduces a deprecated compatibility path; no new dependencies or shims.
- *Inline object selectors everywhere*: v5 infinite-loop risk and unnecessary re-renders.
- *A single god-hook selecting all four stores*: recreates the 45-field context under a new name.

**Compatibility.** Pure selector contracts unchanged; `selectors.test.ts:17-86` remains valid. Hook internals are a rendering detail, not a wire contract.

**Test impact.** Add a DOM-free test that a `useShallow`-wrapped selector returns a stable reference across two equal state objects, and one happy-dom component regression that renders a multi-field selector under state updates without an infinite-loop error. Keep the shim source assertions at `workflow-editor-shim.test.tsx:191-207` until T-124 deletes the shim.

**User-visible behavior.** **No change.** This is render-stability work; it only prevents a class of runtime loops and excess renders.

## Ownership summary (no new stores)

| Concern | Single owner | Notes |
|---|---|---|
| Graph, metadata, globals, deployment, `isDirty` | `graphStore` | `graphStore.ts:29-74` |
| Node visuals, executions, logs | `runtimeStore` | `runtimeStore.ts:28-68` |
| Panels/history, selection id, handle, deploy dialog | `uiStore` | `uiStore.ts:18-45`; no sheet booleans (D2) |
| `runId`, bootstrap/in-flight/save flags | `sessionStore` | `sessionStore.ts:21-55` |
| Network command orchestration | `workflowCommandApi.ts` module instance (stateless) | D3; factory remains injectable |
| Offline draft | Dexie behind `adapters/workflowDraft.ts` | unchanged; no `persist` middleware |
| Rendered canvas nodes/edges | React Flow local state driven by `deriveReactFlowView` | `Editor.tsx:50-51,93-102`; unchanged |
| React Flow instance | one outer `ReactFlowProvider` | D4 |

## Consequences

**Positive**
- Every context member has a permanent store, derived-view, or module-command home before the shim is deleted.
- No second node representation, no write-only flags, no duplicate React Flow instance, no panel-validation split.
- Components depend on explicit imports/selectors; error policy has one owner; wire behavior is pinned by tests.

**Negative / new obligations**
- One new small file for the bound command API and one for error policy; `defaultGetAccessToken` moves out of bootstrap.
- Two behavior changes (D4 fit/instance unification, D5 panel opening) require user sign-off; implementation must not bundle them silently.
- `getExecutionLogs`/`deployWorkflow`/`runWorkflow` consumers must switch from context wrappers to imported functions with an explicit `workflowId`.
- T007's "`uiStore` owns `selectedNode`" wording is superseded by D1; future readers must follow this ADR.

**Neutral**
- No new dependency, no persistence change, no folder reorganization, no HTTP/realtime change, no change to the five T-141 batch boundaries (6+8+3+2+8 files; `.agents/reports/T-141.md:8-16`).

## Boundary and dependency impact

- **Removed:** all 27 consumers → `useWorkflowEditor`/`WorkflowEditorContext` (`.agents/reports/T-120.md:33-65`); shim → `WorkflowSessionContext` at T-124; duplicate page-level `ReactFlowProvider` edge.
- **Changed:** selection writes → `uiStore.selectNode`; selection reads → `selectSelectedNodeView` (graph + ui); command calls → `workflowCommandApi.ts` imports; error policy → `commands/workflowErrorReporting.ts`; provider composition loses `onError` prop.
- **Added:** `selectors.ts` gains a pure derived selection view; `uiReducer` accepts `graph-navigator` via the corrected list; one `useReactFlowView` hook memoizes derived canvas data.
- **Preserved direction:** components → store selectors/actions and command API; commands/adapters/bootstrap → stores (vanilla API only at edges); no store imports React Flow, React context, clients, or Dexie directly.
- **Public surface:** internal editor context is deleted per D-05; external HTTP/realtime contracts remain frozen.

## Migration sequence

Each step keeps the app working and is independently revertible. T-141's five disjoint batches remain the unit of work; one owner per file.

1. Add the pure `selectSelectedNodeView` and `useReactFlowView` memoization; keep the shim unchanged. Tests: selector + shallow/memo regressions. (D1, D6; no behavior change.)
2. Add `workflowCommandApi.ts` and `workflowErrorReporting.ts`; switch bootstrap to publish the same instance into `WorkflowSessionContext`. Keep all shim wrappers and toasts green. (D3; no behavior change.)
3. Migrate T-141 batches A–D to selector/action imports. Remove the four write-only setter calls and the three dead booleans in their owning files; remove `selectedNode` object reads in favor of D1's derived view. Compile per cutoff. (D1, D2, D6.)
4. In the canvas batch, delete imperative `addNodes/addEdges` from template insertion (use `insertTemplateNode`) and delete the duplicate `ReactFlowProvider` in the same commit. Verify one provider instance with the composition regression. (D4; **user approval required**.)
5. Correct `PANEL_IDS` and migrate the Library button to the validated open action; add panel regression. (D5; **user approval required**, or record an explicit approved deviation to preserve the no-op.)
6. Delete `useWorkflowEditor.tsx`, `WorkflowEditorProvider.tsx`, `WorkflowSessionContext` and `shim/` at T-124; enable CI greps for context symbols, sheet flags, `getState()` in components and the frozen wire strings (T-007 `:161`). No rollback shim survives.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Derived `selectedNode.data` shape drifts from `deriveReactFlowView` (`label`) | Medium | Medium (config panel initial values) | D1 pins `config + label`; selector test compares both outputs |
| Error-policy move changes toast text/contexts | Medium | High (visible UX regression; T-122 acceptance) | D3 requires byte-for-byte move plus pinned context/message test; T-122 regressions must stay green |
| One-provider change makes template node appear twice before 200 ms sync | Medium | Medium | D4 couples provider removal with removal of imperative `addNodes/addEdges` in one commit; composition regression asserts one node |
| `graph-navigator` fix shipped without approval | Medium | Medium (unrequested UX change) | D5 is gated on explicit approval; if withheld, preserve no-op and record deviation |
| Deleted sheet setters relied on by out-of-repo code | Low | Medium | Repo-wide grep is clean; T-124 gate rechecks; T-007 `:192` open question remains unverified |
| v5 inline selector causes loop in a migrated consumer | Medium | High (client render crash) | D6 rule + shallow/memo regression tests + `pnpm check-types/lint/test` gates |
| Module-level command API captures wrong ports under SSR | Low | Medium | Port modules are already imported by bootstrap at module scope; tests mock them; verify `pnpm build` |

## Verification

- **Read-only evidence:** all claims above were checked against the cited source lines; no source edits were made by this task.
- **Tests:** `pnpm test`, `pnpm check-types`, `pnpm lint`, `pnpm build` must remain at the T-122/T-139 baseline (`.agents/ledger.yaml:563,706`) after each batch; targeted store/shim/composition suites must pass before and after each change.
- **Boundary greps:** zero `useWorkflowEditor|WorkflowEditorContext` after step 6; zero sheet symbols; zero new web→`@neuron/db` imports; zero `persist`; zero `getState()` in React components; exactly one `ReactFlowProvider` in the editor subtree.
- **Wire contract:** realtime channel/event strings and response shapes unchanged (`adapters/workflowRealtime.ts:50-68`); no HTTP change.
- **Behavior attestations:** D1/D2/D3/D6 assert no user-visible change; D4/D5 assert explicit changes and are not implemented without approval.

## Self-review — six blocking decisions

| # | T-141 blocker | Recommendation | Rationale / alternatives / compatibility / tests / behavior statement |
|---|---|---|---|
| 1 | `selectedNode` has no store equivalent | D1: `selectedNodeId` + derived view | all five present in D1 |
| 2 | four sheet flags write-only | D2: delete all seven flags and four dead calls | all five present in D2; three extra dead flags found and covered |
| 3 | command lifetime / permanent locator | D3: stateless module command API + moved error policy | all five present in D3 |
| 4 | duplicate `ReactFlowProvider` | D4: one outer provider, remove page wrapper and imperative mirror | all five present in D4; behavior change flagged |
| 5 | `graph-navigator` no-op | D5: fix `PANEL_IDS`, use validated open action | all five present in D5; behavior change flagged |
| 6 | Zustand v5 selector stability | D6: stable selectors, `useShallow`, `useMemo` derived views | all five present in D6; Context7 v5.0.12 docs cited in Context |

## Open questions

  - Resolved: the user approved D4 and D5 via D-07 and D-08 in `.agents/decisions/user-decisions.md`; implementation of steps 4–5 is authorized.
- Are there out-of-repo consumers of the seven deleted flags? No in-repo evidence exists (T-120 `:65`); reconfirm at the T-124 gate.

## Report metadata

- task id: T-144
- role: architect
- status: proposed; concrete recommendation complete for all six decisions
- scope: `apps/web/stores/workflow/**`, `apps/web/hooks/workflow/**`, `apps/web/providers/WorkflowEditorProvider.tsx`, `apps/web/app/(editor)/**`, `apps/web/components/workflow/editor/**` and relevant tests — read-only
- files changed: `.agents/decisions/T-144-frontend-migration-decisions.md` only; the generic `.agents/reports/T-144.md` output is suppressed by the explicit single-file lease (same precedent as T-007 `:203`)
- commit status: none; no source/test/config edits; no new dependencies; no suppressions
- verification: full reads of `AGENTS.md`, `context/NEURON_ENGINE.md`, `context/DESIGN_RULES.md`, `.agents/ownership.yaml`, T-144 lease in `.agents/ledger.yaml`, T-007/T-121/T-122/T-141 reports, all in-scope store/provider/app/component sources and relevant tests; Context7 v5.0.12 Zustand migration docs; `git status --short --branch` showed only pre-existing coordinator edits to `.agents/ledger.yaml` and `.agents/decisions/user-decisions.md`, untouched by this task.
