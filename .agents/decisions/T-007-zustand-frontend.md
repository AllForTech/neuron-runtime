# 0007 — Addendum to 0003: Zustand-based frontend state architecture and direct consumer migration

- Status: proposed
- Date: 2026-11-19
- Owners: architect
- Related tasks: T-003 (superseded sections only), T-005, T-007
- Lease: `.agents/decisions/T-007-zustand-frontend.md` only — no source/test/config writes by this agent

This ADR is an **addendum**, not a replacement for `.agents/decisions/T-003-architecture.md`. It overrides only the frontend-state sections named in "Reconciliation with T-003" below; all other T-003 decisions remain in force.

## Context

### Mandated instruction files and pre-existing gaps

- `AGENTS.md` read in full (757 lines). It requires architecture before code (`AGENTS.md:214-223`), single responsibility (`AGENTS.md:225-241`), explicit data flow and no hidden state mutation (`AGENTS.md:244-253`), no god files (`AGENTS.md:268-277`), and no speculative abstraction (`AGENTS.md:143-151` via T-003 D6).
- `context/DESIGN_RULES.md` read in full (105 lines). It is a visual-token specification; it imposes no state-boundary constraint. The hardcoded edge colors at `WorkflowEditorProvider.tsx:276-277` remain a pre-existing violation, out of this task's scope.
- **P-001 persists:** `context/NEURON_RUNTIME.md` is still absent (read returned "File not found"; `.agents/ledger.yaml:15-19`). No runtime behavior contract exists to consult.
- `.agents/ownership.yaml:2-3` still records no path ownership. Leases in the Migration plan are proposals for the implementing tasks.
- `git status --short --branch` on `main`: only pre-existing `?? .agents/`; `git log --oneline -3` head `30c939e`. No working-tree changes made by this review.

### Verified current structure (observed, cited)

**Editor god-module and its consumers**
- `apps/web/providers/WorkflowEditorProvider.tsx` is 596 lines. `WorkflowEditorContextType` declares ~45 values (`:47-96`); `createContext` at `:133`; provider value at `:574-596`.
- Three reducers live inline: `workflowEditorReducer` (`:174-224`), `runtimeReducer` (`:226-254`), and the already-separated `editorUIReducer` (`constants/editor-panel.ts:51-141`, imported at `WorkflowEditorProvider.tsx:21`).
- ~12 independent `useState` UI flags (`:143-166`) coexist with the panel reducer; three mutable refs own save coalescing (`saveTimeout`, `retryTimeout` at `:140-141`; `isSaving`, `pendingSave`, `isLoadingRef` at `:168-170`).
- Derived React Flow nodes/edges are memoized at `:256-283`; edge animation reads `editorState.runtime.activeEdges` (`:270`, `:283`).
- Cloud load maps DB rows to domain nodes at `:306-314` (`positionX/Y` → `position:{x,y}`); cloud save with retry is `:332-399` using `RETRY_DELAY_MS = [1000,3000,7000,15000,30000]` (`:135`) and a 3000 ms debounce (`:557-568`).
- Dexie draft is read with `useLiveQuery` (`:172`), written at `:542-555`, updated with `synced:true` at `:368`, and re-read as the **cloud payload source** at `:348-362`. `lib/db/workflow.db.ts:11-22` owns the `drafts` table keyed by `id` (`workflowId`).
- Run/deploy/delete commands are `:437-509`; logs fetch is `:511-531`; realtime wiring is one call at `:285`.
- `useWorkflowEditor()` (`apps/web/hooks/workflow/useWorkflowEditor.tsx:3-10`) is a thin `useContext` wrapper that throws outside the provider.
- Targeted grep found **55 textual matches**: 27 importing consumer files plus the hook definition. This is fewer than the task's verified input of "61 consumers"; the difference must be reconciled with an AST-based inventory before the codemod (see Stage 0). Consumers also dispatch directly, not only read: `GlobalVariableSheet.tsx:44,79`, `NodeConfigPanel.tsx:47,63`, `Editor.tsx:114,137,172,190`, `TriggerNode.tsx:34`, `DynamicNode.tsx:58`, `DynamicNodeToolbar.tsx:46`.
- Several context fields are **dead** (provider-only, no consumer in this repo): `isSheetOpen`, `sheetOpen`, `openConfigSheet`, `isGlobalVariableSheetOpen`, `isEditorPanelOpen`, `isExecutionsSheetOpen`, `isWorkflowInspectorOpen`, `saveStatus`, `retryCount`, `isWorkflowSaving`, `setLogs`, `selectedHandle` setter. Live fields include `isDeployWorkflowDialogOpen` (`Editor.tsx:261`), `isWorkflowLoading` (`Editor.tsx:220`), `isLogsLoading` (`ExecutionLogsViewer.tsx:19,46`), `nodeCatalog` (`Editor.tsx:44`, `NodeConfigPanel.tsx:25`, `NodeTemplatePanel.tsx:17`).

**Duplicated state representations (evidence for single-owner rules)**
- Node visuals: `editorState.runtime.nodeStatus/nodeErrors/nodeOutputs/activeEdges` are live (`TriggerNode.tsx:27`, `DynamicNode.tsx:49-50`, `DynamicNodeToolbar.tsx:36-42`, `NodesInspector.tsx:66`, `BaseEdge.tsx:11`, `ExecutionTrace.tsx:39`, `WorkflowEditorProvider.tsx:270`); `runtimeState.nodeStatus/activeEdges` have no component consumer (grep of `runtimeState.*` found only `executions` and `logs` reads at `ExecutionHistoryPanel.tsx:20-25` and `ExecutionLogsViewer.tsx:23-24,105`).
- Executions: `editorState.runtime.executions` (`WorkflowEditorProvider.tsx:107,120,219-220`) has no consumer; `runtimeState.executions` is live (`ExecutionHistoryPanel.tsx:20-25`, `ExecutionLogsViewer.tsx:23-24`).
- Logs: local `logs/setLogs` (`WorkflowEditorProvider.tsx:165,590`) has no consumer; `runtimeState.logs` is live (`ExecutionLogsViewer.tsx:105`).
- **Two event pipelines feed visuals:** `workflow_action` payloads go to `workflowEditorDispatch` (`useWorkflowRealtime.tsx:18-23`) and set node status via `WorkflowEditorActionType.NODE_EXECUTION_*` (`constants/index.ts:157-159`, reducer `:205-210`); `workflow_runtime_action` payloads go to `runtimeDispatch` (`useWorkflowRealtime.tsx:24-29`) and set `SET_EDGE_ACTIVE`/`SET_NODE_STATUS` (`types/index.ts:59-70`, reducer `:228-231`). Both channel names, both event labels and the string values are frozen. `RESET_NODE_STATUS` (`:203-204`, clears status/errors/outputs only) and `RESET_FLOW_VISUALS` (`:247-248`, clears status/activeEdges only) have **different field sets**; a naive merge changes behavior.

**Dependency and manifest facts**
- `zustand` is **not declared** in `apps/web/package.json` (`:17-81`). It exists only transitively in `pnpm-lock.yaml` (`zustand@4.5.7:7091`; `zustand@5.0.12:7106`, resolved with `@types/react@19.2.2`, `react@19.2.3`, `use-sync-external-store@1.6.0` at `:8980-9001,14117`). React is `19.2.3` (`apps/web/package.json:70`), Next `16.1.6` (`:67`).
- Duplicated dependency families to clean up separately: `framer-motion` (`:61`) + `motion` (`:65`); `reactflow` (`:74`) + `@xyflow/react` (`:49`). `EditorProvider` still imports `ReactFlowProvider` from legacy `reactflow` (`app/(editor)/Provider.tsx:3`).
- `@neuron/db` is a direct web dependency (`apps/web/package.json:37`) imported by exactly 15 files (grep confirmed): the editor provider plus `WorkflowProvider.tsx:11`, `DashboardContext.tsx:12`, `WorkspaceProvider.tsx:8`, `VaultProvider.tsx:6`, `components/dashboard/ExecutionFeed.tsx:4`, `lib/utils.ts:18`, `app/(root)/dashboard/(settings)/settings/vault/page.tsx:27`, `DeploymentPanel.tsx:35`, `DeploymentHistoryItem.tsx:13`, `WorkspaceContainer.tsx:18`, `DraggableWorkflowWrapper.tsx:6`, `WorkflowActionsDropdown.tsx:17`, `LogsTimeline.tsx:24`, `ExecutionCard.tsx:12`. T-003 step 9 remains the owner of that decoupling.
- Provider nesting: `app/layout.tsx:46` → `Providers` (`app/Provider.tsx:9-23`: Theme/Auth/Vault/Tooltip); `app/(root)/layout.tsx:13` → root `Provider` (`app/(root)/Provider.tsx:9-19`: Workflow/Workspace/Sidebar/Dashboard); editor route uses `app/(editor)/Provider.tsx:9-18` (`ReactFlowProvider → NodeOutputProvider → WorkflowEditorProvider → ValidationProvider`).
- No test runner is configured: `apps/web/package.json:5-12` has no `test` script; no `vitest`/`jest`/`@testing-library` declarations found. T-003 step 1 is therefore a hard prerequisite (also its stated "Blocker for steps 4-8").

### Context7 verification (current documentation, not training memory)

Library resolved: `/pmndrs/zustand` (High source reputation, 876 snippets; version list includes v5.0.14, v5.0.12, v4.5.7). Three scoped queries were run; verified facts used in this decision:

1. **Slices, `create`, selectors, `useShallow`** — `docs/learn/guides/advanced-typescript.md` and `README.md`:
   - `StateCreator<MyState, [], [], MySlice>` defines one slice; slices are combined with `create<SliceA & SliceB>()((...a) => ({ ...createSliceA(...a), ...createSliceB(...a) }))`.
   - Middleware changes the mutator tuple, e.g. devtools: `StateCreator<MyState, [["zustand/devtools", never]], [], MySlice>`.
   - `useShallow` from `zustand/react/shallow` (the v5 migration doc also shows `zustand/shallow`) wraps object/array/mapped selectors for shallow equality; `useShallow((s) => ({ a: s.a, b: s.b }))`.
2. **`persist`** — `docs/reference/middlewares/persist.md`: `persist(stateCreatorFn, { name, storage, partialize, onRehydrateStorage, version, migrate, merge, skipHydration })`; default storage is `createJSONStorage(() => localStorage)` with a lazy getter (SSR-safe at module evaluation); `useStore.persist.rehydrate()` for manual hydration; explicit warning that JSON storage performs **no runtime validation** of rehydrated data.
3. **Outside React and React 18/19** — `README.md` and `src/react.ts`: vanilla `createStore` from `zustand/vanilla` exposes `getState/setState/subscribe/getInitialState`; hook usage is not recommended in React Server Components; the React binding uses `useSyncExternalStore(api.subscribe, memoized selector(api.getState()), selector(api.getInitialState()))`, so selectors must be referentially stable and the initial state is the server snapshot.
- **Partially verified:** only the devtools *mutator type signature* was returned (from query 1); full devtools option surface was not fetched within the 3-query cap. Any devtools adoption must re-check its current API before implementation; this addendum does not depend on those options.
- Version decision: add `zustand@5.0.12` as an **exact direct dependency** so pnpm reuses the lockfile entry already resolved against React 19.2.3 (`pnpm-lock.yaml:7106,14117`). Upgrading to 5.0.14 is a separate, measured change.

## Decision

### D1 — Four Zustand stores, one owner per state slice

All new files live under `apps/web/stores/workflow/` (new folder; this ADR supplies the required ADR + migration plan). Each store is created with `create<T>()(...)` from `zustand`; creators call **pure transition functions in `transitions/`** so every state change is testable without React or DOM. No slice is persisted by Zustand.

| Store | Owns (single owner) | Does not own | Justification |
|---|---|---|---|
| `graphStore.ts` | `workflowId`, `graph` (nodes/edges records), `workflow` metadata, `globalVariables`, `deployment`, `isDirty` | Execution visuals, executions, logs, UI flags, draft rows | Shared by the largest consumer set; edits must be observable across the tree; transitions are the extracted `workflowEditorReducer` (`:174-224`) minus duplicate runtime branches. |
| `runtimeStore.ts` | `nodeStatus`, `nodeOutputs`, `nodeErrors`, `activeEdges`, `executions`, `logs` | Graph content, UI flags | High-frequency realtime updates; isolated so a status tick does not re-render graph editors. This is the single owner that eliminates all three duplicated representations. |
| `uiStore.ts` | Panel state (`activeLeftPanel`, `activeRightPanel`, both histories, via the existing pure `editorUIReducer`), `selectedNode`, `selectedHandle`, and only the live sheet/dialog booleans (`isDeployWorkflowDialogOpen`) | Async/in-flight flags, graph content | Ephemeral view state shared by menus, panels and sheets. Dead booleans (`:149-157` except the deploy dialog) are **deleted, not migrated**. |
| `asyncStore.ts` | `saveStatus`, `retryCount`, `isWorkflowSaving`, `isWorkflowLoading`, `isRunning`, `isDeploying`, `isLogsLoading` | Draft content, panel state | One authoritative place for in-flight/retry flags consumed by menus and panels; keeps status writes out of the graph store. |

Explicit non-stores (bounded scope, no over-engineering):
- **Dexie remains the sole owner of the offline draft** (`lib/db/workflow.db.ts:11-22`). It keeps the debounce→cloud→`synced:true` flow and the cloud payload source at `WorkflowEditorProvider.tsx:348-362` byte-for-byte in behavior. A typed adapter `adapters/workflowDraft.ts` wraps `db.drafts` plus `liveQuery` and is the only module permitted to touch the table. No `persist` middleware wraps any editor store: that would double-persist graph data and introduce SSR hydration mismatch risk in Next 16.
- **`nodeCatalog` is immutable dependency data**, not state: consumers (`Editor.tsx:44`, `NodeConfigPanel.tsx:25`, `NodeTemplatePanel.tsx:17`) import it from `@neuron/nodes/client` directly.
- **Theme/Auth/Vault/Sidebar/Tooltip providers stay as providers in this phase.** `next-themes`, Supabase session and secret access are owned by existing libraries/security-boundary code (`app/Provider.tsx:9-23`); wrapping them in Zustand would create a second owner and encourage ambient access from arbitrary components. Sidebar is a Radix context with DOM/ref concerns (`app/(root)/Provider.tsx:14`).
- **Dashboard/Workspace/Workflow-list providers are follow-up candidates, not T-007 scope.** They have independent consumer sets and their own `isWorkflowLoading`/`isLogsLoading` state (`WorkflowProvider.tsx:62`, `DashboardContext.tsx:38`) — different features, not duplicates of the editor runtime store. A later ADR may convert them to stores one at a time with their own leases; no speculative conversion now.

### D2 — Action and selector contracts

- **Actions are named methods on each store**, generated from the existing enums: `setWorkflowId`, `setGraph`, `addNode`, `updateNode`, `updateNodePosition`, `deleteNode`, `addEdge`, `deleteEdge`, `updateEdge`, `updateGlobalVars`, `setDeployment`, `updateDeployment`, `markClean` (graph); `applyNodeExecutionStart/Success/Error`, `setNodeStatus`, `setEdgeActive`, `setExecutions`, `addExecution`, `updateExecution`, `setLogs`, `addLog`, `updateLogs`, `resetNodeStatus`, `resetFlowVisuals`, `clearRuntime` (runtime); `openPanel`, `closePanel`, `togglePanel`, `setActivePanel`, `closeAll`, `selectNode`, `setSelectedHandle`, `setDeployDialogOpen` (UI); `setSaveStatus`, `setRetryCount`, `setLoading`, `setSaving`, `setRunning`, `setDeploying`, `setLogsLoading` (async).
- **Enum→transition map is one-to-one and behavior-preserving.** The pure reducers keep their current field sets: `resetNodeStatus()` clears `nodeStatus/nodeErrors/nodeOutputs` only (`:203-204`); `resetFlowVisuals()` clears `nodeStatus/activeEdges` only (`:247-248`). `WorkflowEditorActionType.SET_EXECUTIONS` (`:219-220`) and the three duplicate representations are deleted after grep confirms zero consumers.
- **Selectors are exported pure functions** from `selectors.ts` (e.g. `selectNodeStatus(id)`, `selectRuntimeLogs`, `selectActiveEdges`, `selectUiFlags`) and reused with `useShallow` at multi-field call sites (`useShallow((s) => ({ a: s.a, b: s.b }))`). Stable selector references are required because Zustand memoizes `selector(api.getState())` via `useCallback` (`src/react.ts`).
- **Derived React Flow data** (`rfNodes`/`rfEdges`, `:256-283`) becomes a pure `deriveReactFlowView(graph, selectedNode, activeEdges)` in `selectors.ts`, consumed through one `useReactFlowView()` hook. The hardcoded stroke hexes stay unchanged in this phase (design-rule debt tracked separately).

### D3 — Side effects live at edges, not in reducers

- `adapters/workflowRealtime.ts` replaces `hooks/workflow/useWorkflowRealtime.tsx`: it subscribes to frozen channel `workflow_${runId}` and frozen events `workflow_action` / `workflow_runtime_action`, and maps payloads to `runtimeStore` actions. It keeps current unvalidated forwarding semantics and the exact event strings (`constants/index.ts:157-159`); payload validation stays T-004 scope. Both event families now converge on the single runtime owner (fixes the two-pipeline split without changing wire behavior).
- `commands/workflowSync.ts` owns the 3000 ms debounce and the `[1000,3000,7000,15000,30000]` retry schedule with injected timer functions and explicit inputs (`workflowId`, token provider, draft adapter, cloud client). It writes only `asyncStore` status and calls `graphStore.markClean()` after success — no direct writes into another module's state.
- `commands/workflowCommands.ts` owns cloud load, run, deploy, delete and log fetch, reusing the row→domain mapper from T-003 D3 (`WorkflowEditorProvider.tsx:306-314`). Pure mapping is in `lib/graphMappers.ts` (T-003 D4); no new mapper representation is introduced.
- `bootstrap/WorkflowSessionBootstrap.tsx` is the only React composition component: it wires realtime, draft `liveQuery` subscription and initial cloud load, then renders children. It replaces `WorkflowEditorProvider` in `app/(editor)/Provider.tsx:13`; `ReactFlowProvider`, `NodeOutputProvider` and `ValidationProvider` remain untouched.
- `getState()/setState()` from Zustand are permitted **only** in adapters/commands/bootstrap (verified vanilla API), never during React render. Components use selector hooks.

### D4 — Temporary shim with hard cutoff (no permanent adapter)

- `apps/web/hooks/workflow/useWorkflowEditor.tsx` is rewritten as a **temporary read adapter** that composes selectors from the four stores and returns the legacy object shape (`:47-96`) with stable action references. It is the sole migration bridge; it is **deleted by the end of T-007**, together with `WorkflowEditorContext`, `WorkflowEditorContextType` and `WorkflowEditorProvider.tsx`.
- Consumers migrate in per-slice batches; after the last consumer of a slice migrates, that slice's fields are removed from the shim's return type, so remaining stragglers surface as compile errors. After the fourth cutoff the shim file itself is removed. No re-export or compatibility hook survives the phase.
- The shim subscribes to all four stores with `useShallow`; that is an acceptable *temporary* cost because each batch shrinks its consumer set until the shim is gone.

## Alternatives considered

- **A. Keep T-003's context split with reducers + hooks (rejected).** User explicitly overrode it: Zustand is the state manager and all consumers migrate in this phase. Keeping the context value shape would also preserve the ~45-field god contract and the duplicated representations.
- **B. Big-bang replacement of the provider and all consumers in one commit (rejected).** With no test runner configured and dispatch calls scattered across six components, a single cutover has no per-slice rollback point. The staged per-slice cutoffs preserve a working system at each step.
- **C. `persist` middleware for graph/draft state (rejected).** Dexie already owns the offline draft and the `synced` flag (`workflow.db.ts:8`, `WorkflowEditorProvider.tsx:348,368,546-552`); JSON storage has no runtime validation and SSR-safe hydration would need `skipHydration`. Two owners would double-persist and risk divergence.
- **D. App-wide single Zustand mega-store (rejected).** It would recreate the god object under a new name and couple unrelated domains; four stores with one owner each keep dependency direction explicit and bound re-render scope.
- **E. Migrate Theme/Auth/Vault/Dashboard/Workspace/Sidebar stores in T-007 (rejected as scope creep).** Those providers have separate consumer sets and leases; security-sensitive session state (T-004) and library-owned theme/sidebar state should not be reshaped incidentally. Recorded as future, separately justified work.

## Consequences

**Positive**
- One owner per state slice; the three duplicated representations are gone and both realtime event pipelines converge on `runtimeStore`.
- Pure transitions are unit-testable with no React/DOM; selectors are plain functions; side effects sit at typed adapters/commands.
- Consumers access only the slices they need (`useShallow`), reducing re-render scope versus the monolithic context.
- HTTP routes/responses, realtime channel/event strings, execution behavior, retry schedule and Dexie identity are unchanged.

**Negative / new obligations**
- A new `apps/web/stores/workflow/**` folder and a direct `zustand` dependency must be maintained.
- The temporary shim must be actively deleted; leaving it in place reintroduces a competing public contract. This is the highest-priority cleanup obligation.
- The dead context fields are dropped; any out-of-repo consumer relying on them would break (no evidence of such a consumer in this repo; verify before deletion).
- Store types must use `@neuron/shared` contracts, not `@neuron/db` row types; T-003 step 9 still closes the remaining 14 web→db files.

**Neutral**
- Devtools are not added in T-007. If added later, wrap stores at composition time and use the verified mutator typing `StateCreator<T, [["zustand/devtools", never]], [], Slice>`; re-check the current API first.

## Boundary and dependency impact

- **Added edges:** consumers → `apps/web/stores/workflow/**` (selector/action imports only); bootstrap → adapters/commands → stores; commands → `@neuron/client` + `@neuron/shared` contracts + draft adapter.
- **Removed edges:** consumers → `WorkflowEditorContext` (all 27 importing files); provider → three inline reducers; provider → `useWorkflowRealtime`; provider → Dexie table; `useWorkflowEditor` → `useContext`.
- **Changed:** `runtimeStore` becomes the only writer/reader of node visuals, executions and logs; `graphStore` stops carrying runtime executions; Dexie remains adapter-owned; no new web→`@neuron/db` import is permitted.
- **Public surface:** the internal context shape is explicitly **not frozen** and is deleted at phase end. HTTP routes, response shapes, realtime channel names/event strings, execution behavior, retry schedule, and Dexie draft identity are frozen and unchanged.

## Reconciliation with T-003 (explicit overrides and preserved items)

**Overridden by this addendum**
- `T-003 D4` (`:109-130`): the split into reducers + hooks with the context value frozen is replaced by four Zustand stores + direct consumer migration. The extracted pure reducers survive as `transitions/*`, but the context type and provider are deleted.
- `T-003 migration steps 6-7` (`:238-239`): replaced by this ADR's Stages 1-5. Step 6's pure extraction survives only as Stage 1 content.
- `T-003 invariant 13` (`:227`): "Public context shape of `useWorkflowEditor()` and all 61 consumers" is **overridden** — the context shape is not frozen and all consumers migrate directly to stores. The temporary shim is deleted, not preserved.
- `T-003 D7.5` (`:161`): "Provider slice tests via reducers extracted from the provider" becomes "store transition + selector + bridge contract tests" (no React).
- `T-003 Verification` (`:266`): the compile-time assertion of context shape is replaced by compile-time assertions of store action/selector contracts and CI grep gates for context removal.

**Preserved unchanged**
- T-003 D1-D3, D5, D6, D7.1-D7.4, D7.6; migration steps 1-5 and 8-10 (with the note that T-007 adds no new `@neuron/db` imports and step 9 owns the remaining 14 files).
- Invariants 1-12 (`:215-226`), including: local-first debounce 3000 ms and retry schedule `[1000,3000,7000,15000,30000]` (invariant 9, `:223`); Dexie identity keyed by `workflowId` (invariant 10, `:224`); `x-neuron-key` handling (invariant 11, `:225`); process-level error behavior (invariant 12, `:226`); realtime channel/event strings (invariants 4-5, `:218-219`); row→domain mapping (invariant 8, `:222`).

## Migration plan

Ordered; each stage keeps the app working and is independently revertible. `Lease` = proposed exclusive write scope. Stage 0 depends on T-003 step 1 (test gate); Stage 5 depends on Stages 1-4.

0. **Safety net + inventory (no behavior change).** Add working `check-types`/`lint`/`test` scripts (T-003 step 1). Regenerate the consumer inventory with an AST-based count, reconciling the "61" figure against the 55 textual matches / 27 importing files observed here, and list every `workflowEditorDispatch`/`runtimeDispatch` call site. *Lease: `package.json`, `turbo.json`, `.github/**, new test files.* **Blocker for all later stages.***
1. **Create stores and pure transitions (no consumer changes).** Add exact `zustand@5.0.12`; add `stores/workflow/**` with `graphStore`, `runtimeStore`, `uiStore`, `asyncStore`, `transitions/*`, `selectors.ts`, adapters, commands, bootstrap. Characterization-test every transition against current reducer behavior, including the distinct `resetNodeStatus` vs `resetFlowVisuals` field sets. *Lease: `apps/web/stores/workflow/**, apps/web/package.json.* **Parallel with T-003 steps 2-5 (disjoint lease).***
2. **Install the temporary shim.** Rewrite `useWorkflowEditor.tsx` to read from the four stores; swap `EditorProvider.tsx:13` from `WorkflowEditorProvider` to `WorkflowSessionBootstrap`; keep the old provider file unreferenced but present until Stage 5. Run full characterization suite. *Lease: `apps/web/hooks/workflow/useWorkflowEditor.tsx`, `apps/web/app/(editor)/Provider.tsx`.*
3. **Batch consumer migration (per-slice cutoffs).** Each batch: codemod import/selector changes + manual action-call rewrite, typecheck, tests, then remove that slice from the shim.
   - **A — UI/panels:** `hooks/workflow/panel/useEditorPanel.tsx`, `layout/{EditorLayout,Sidebar}.tsx`, `layout/panels/PanelContainer.tsx`, `menu/{EditorLeftMenu,EditorRightMenu,EditorBottomMenu,EditorTopMenu}.tsx`, `Panel/{GlobalVariableSheet,NodesInspector,NodeConfigPanel,templates/NodeTemplatePanel,deployment/DeploymentPanel}.tsx`, `providers/ValidationContext.tsx`.
   - **B — graph:** `components/workflow/editor/Editor.tsx`, `edge/BaseEdge.tsx`, `UpstreamNodePicker.tsx`, `config/renderer/fields/{TemplateField,KeyValueField}.tsx`, `nodes/{TriggerNode,DynamicNode}.tsx`, `nodes/toolbar/DynamicNodeToolbar.tsx`. Replace direct `workflowEditorDispatch` calls with named actions.
   - **C — runtime/execution:** `components/workflow/editor/{ExecutionTrace}.tsx`, `nodes/{TriggerNode,DynamicNode}.tsx`, `nodes/toolbar/DynamicNodeToolbar.tsx` (status reads), `Panel/NodesInspector.tsx`, `executions/{ExecutionHistoryPanel,ExecutionLogsViewer,LogsTimeline}.tsx`.
   - **D — commands/static data:** `Panel/deployment/DeploymentPanel.tsx`, `Panel/deployment/DeploymentHistoryItem.tsx`, and the `nodeCatalog` consumers (`Editor.tsx`, `NodeConfigPanel.tsx`, `NodeTemplatePanel.tsx`) → direct `@neuron/nodes/client` imports.
   - Batches A-D touch some overlapping files (e.g. `TriggerNode`, `Editor`, `DeploymentPanel`); assign one owner per file in the lease table so no two batches write the same file concurrently.
4. **Delete duplicates after each cutoff:** dead booleans, `runtimeState.nodeStatus`, `editorState.runtime.executions`, local `logs/setLogs`, unused enum branches (`WorkflowEditorActionType.SET_EXECUTIONS`, `EDGE_*` only if grep is clean) and the old `RuntimeState` type. *Lease: `apps/web/stores/workflow/**, apps/web/constants/index.ts, apps/web/types/index.ts, apps/web/providers/WorkflowEditorProvider.tsx` (last batch only).*
5. **Final removal + CI gates.** Delete `useWorkflowEditor.tsx`, `WorkflowEditorProvider.tsx`, `useWorkflowRealtime.tsx`; add CI greps: zero `WorkflowEditorContext|useWorkflowEditor` in `apps/web/**`, zero `apps/web/** → @neuron/db`, zero `persist` import in `apps/web/stores/**`, zero `getState()/setState()` in React components, and wire-contract test for channel/event strings. *Lease: `apps/web/**` cleanup + `.github/**` (separate task if workflows are outside the web lease).*
6. **Follow-ups (not T-007):** remove the `framer-motion`/`motion` and `reactflow`/`@xyflow/react` duplicate dependencies with measured bundle evidence; convert Dashboard/Workspace/Workflow-list state in separate ADRs; address design-token violations.

**Rollback:** each stage is one revertible commit with no schema migration. Stage 2 is the only behavioral bridge; its rollback is the revert commit plus reinstating `WorkflowEditorProvider` in `EditorProvider.tsx:13`.

## Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Consumer count mismatch (61 verified input vs 55 textual matches/27 files) | High | Medium (missed consumers at deletion) | Stage 0 AST inventory; per-slice compile-time cutoffs catch stragglers | implementation agent |
| Direct-dispatch sites missed by a selector-only codemod | Medium | High (edits stop working) | Explicit dispatch-site list from Context; Stage 0 grep; action-contract tests | implementation agent |
| `resetNodeStatus` vs `resetFlowVisuals` field sets merged accidentally | Medium | Medium (stale visuals after run) | Separate named actions + characterization tests for each | implementation agent |
| Both realtime pipelines mapped twice or dropped | Medium | High (live execution visuals break) | Single `runtimeStore` owner; wire-contract test asserting both channel/event families and exact strings | implementation agent + T-004 |
| Dexie double-persist or debounce/retry drift | Medium | High (offline save regression) | Dexie sole draft owner; scheduler with injected timers; invariant 9/10 tests | implementation agent |
| Shim left in place permanently | Medium | Medium (competing public contract) | Deletion is a named Stage 5 acceptance criterion + CI grep | coordinator |
| New `@neuron/db` imports while writing store types | Low | Medium | Types from `@neuron/shared`; T-003 step 9 CI gate | implementation agent |
| No test runner at migration start | High | High (silent regressions) | Stage 0 hard blocker per T-003 step 1 | coordinator |
| Zustand/React 19 peer or version drift | Low | Medium | Exact dep `5.0.12` reuses lock entry resolved with React 19.2.3; typecheck gate | implementation agent |

## Verification

- **Store unit tests (no DOM):** call `transitions/*` and vanilla `createStore` APIs (`getState/setState/subscribe`, verified from `zustand/vanilla`) directly; assert all enum-case equivalents including both reset semantics.
- **Selector tests:** import `selectors.ts` selector functions as pure functions; assert `useShallow` equality behavior on object/array picks without rendering.
- **Realtime→store contract tests:** feed frozen channel/event payloads through the bridge mapping; assert `runtimeStore` state and assert the literal `workflow_action`, `workflow_runtime_action`, `NODE_EXECUTION_START/SUCCESS/ERROR`, and `workflow_${runId}` strings.
- **Sync tests:** fake timers assert 3000 ms debounce and `[1000,3000,7000,15000,30000]` retry sequence, `synced:true` update, and pending-save coalescing (invariants 9-10).
- **CI boundary checks:** zero editor React Context, zero web→`@neuron/db`, zero `persist` in stores, no store imperative API in components, plus `pnpm build/check-types/lint/test` from T-003 step 1.
- **Behavior:** characterization tests for invariants 1-12 pass before and after each stage; "compiles" alone is insufficient (`AGENTS.md:412-421`).

## Open questions

- Which count is authoritative for the consumer inventory — 61 (verified task input) or 55 textual matches/27 files observed here? Affects codemod scope and batch size; needs Stage 0 AST output.
- Are the provider-only dead fields (`isEditorPanelOpen`, `sheetOpen`, `openConfigSheet`, `saveStatus`, `retryCount`, `setLogs`, etc.) relied on by any external/out-of-repo consumer? Deletion is proposed; confirm before Stage 4.
- Should `workflow_action` and `workflow_runtime_action` emit both node-status and edge-activation events today (the enum has `EDGE_EXECUTION_START/END` at `constants/index.ts:162-163` but the editor reducer has no cases for them)? Confirm with a captured realtime sample; the bridge preserves current behavior either way.
- Is a devtools middleware wrapper desired at all? Only its mutator typing was verified in this task; the current options API must be re-checked before adoption.
- Does T-004 require realtime payload validation before the bridge is finalized? Validation is deliberately deferred; channel/event strings are frozen.

## Report metadata

- task id: T-007
- role: architect
- status: proposed (recommendation complete; implementation blocked on T-003 step 1 test gate and Stage 0 inventory reconciliation)
- scope: `apps/web/**` state architecture; read-only source inspection; decision file only
- files changed: `.agents/decisions/T-007-zustand-frontend.md` (this file) only — the general `.agents/reports/<task-id>.md` output was suppressed by the explicit single-file lease; the structured chat report carries the review summary
- commit status: no commit made; working tree unchanged except permitted ADR path
- checks run: full reads of `AGENTS.md`, `context/DESIGN_RULES.md`, T-003 ADR, ownership/ledger, editor provider, both app providers, `(editor)` provider, realtime hook, editor hook, Dexie store, `apps/web/package.json`, panel constants, runtime types, editor enum; targeted greps for consumers/dispatch sites/duplicates/db imports/UI flags; `git status --short --branch` and `git log --oneline -3`; 1 Context7 resolve + 3 scoped queries against `/pmndrs/zustand`. No build/lint/typecheck executed (read-only lease; no scripts configured).
