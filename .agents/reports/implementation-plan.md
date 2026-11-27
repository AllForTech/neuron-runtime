# Neuron Runtime — Refactor, Modularization & Cleanup Implementation Plan

- Version: 1.0
- Date: 2026-11-19
- Status: APPROVED FOR BRANCH CREATION — implementation not started
- Owner: coordinator
- Basis: T-001, T-002, T-003, T-004, T-006, T-007 read-only research; user decisions D-01..D-05 in `.agents/decisions/user-decisions.md`

---

## 1. Verified current-state summary

All claims below were independently verified with `file:line` evidence by read-only agents.

### 1.1 Workspace
- pnpm + Turbo monorepo: `apps/api`, `apps/web`, `packages/{auth,client,db,nodes,runtime,shared,ui,sdk/node-*,dev,typescript-config,eslint-config,types}`, `tooling/*` (`pnpm-workspace.yaml:1-5`, `turbo.json:1-31`, `package.json:1-24`).
- `apps/api`: Express v5, controllers call `@neuron/db` repositories directly; no application/use-case layer (`apps/api/src/index.ts:1-64`, controllers, `apps/api/package.json:16-32`).
- `apps/web`: Next.js 16.1.6 App Router, React 19.2.3, provider-heavy state; 15 files import `@neuron/db` directly (`apps/web/package.json:35-40,67,70`; architect ADR D1).
- Domain split exists but leaks: `@neuron/runtime` depends on `@neuron/db` and emits editor UI action events (`packages/runtime/src/execution/runtime.ts:7-11,37-49,54,115,144,168-173,189`).

### 1.2 Execution paths
- Interactive: UI → `@neuron/client` → `GET /api/v1/workflows/execute/:id` → async runtime → DB/realtime → UI (`workflow.routes.ts:41`, `workflow.controllers.ts:316-396`, `engine/execution.ts:12-44`).
- Public deployment: UI deploy → encrypted snapshot → `GET /api/v1/execute/workflow/:deploymentId` → secret check → runtime → HTTP response (`deployment.route.ts:1-8`, `deploy.workflow.controller.ts:173-305`).

### 1.3 Quality baseline (all pre-existing)
- **No tests anywhere** (`Glob **/*.{test,spec}.*` → none; `package.json` has no `test`; `turbo.json` has no `test` task).
- `pnpm check-types` "passes" but is a cache replay covering 1 of 23 packages (`packages/ui`). Fresh `tsc --noEmit` fails: `apps/api` (~20 non-config errors + ~70 TS6059), `apps/web` (13 errors).
- `pnpm lint` exits 2: `packages/ui/eslint.config.mjs:1` imports `@repo/eslint-config/react-internal` which does not exist (`git ls-files packages/eslint-config` → only `README.md`, `package.json`).
- `pnpm --filter frontend lint` exits 1: `next lint .` removed in Next 16 (`apps/web/package.json:9,67`).
- CI job named "Build and Test" runs only `pnpm install` + `pnpm build`; pnpm 8 in CI vs pnpm 9 pinned (`.github/workflows/ci.yml:20-35`, `package.json:21`).
- Broken scripts: `start:api` points to wrong emitted path (`package.json:10` vs `apps/api/tsup.config.ts:4`), `start` is `node node …` (`package.json:12`).

### 1.4 Coupling hotspots
- `apps/api/src/controllers/workflow.controllers.ts` (~396 lines), `deploy.workflow.controller.ts` (~307 lines), `apps/web/providers/WorkflowEditorProvider.tsx` (596 lines, ~45 context values, 3 reducers, duplicated state).
- Duplicates: transform executor (API vs SDK), branching (API vs runtime), node registry (API vs packages), execution orchestration (two controllers with divergent semantics), legacy engine files in `apps/api/src/engine/*`.
- `packages/db/src/services/VaultService.ts:23-26` returns ciphertext on first call, plaintext afterwards.

### 1.5 Security (Phase 0 blockers)
- **Critical**: deprecated `vm2@3.10.5` runs user code on public execution path (`packages/sdk/node-transform/src/execution/execution.ts:2,17-45`; duplicate at `apps/api/src/engine/node-registrys/transform.node.ts:1,20-48`).
- **Critical**: cross-user vault/deployment secret read/delete — no `userId` predicate (`apps/api/src/controllers/vault.controllers.ts:52-77`; `packages/db/src/repository/vault.repository.ts:15-18,47-49`; `deployed.workflow.repository.ts:57-80`).
- **High**: hardcoded AES fallback key in client module (`apps/web/lib/utils.ts:16,229-241`).
- **High**: public exec accepts API key in query string, copies headers/query into `webhookData` and logs (`deploy.workflow.controller.ts:188-216`; `engine/execution.ts:19-27`; `runtime.ts:127,135-140`).
- **High**: unvalidated deployment graph input + SSRF-capable HTTP node (`deploy.workflow.controller.ts:50-65`; `packages/sdk/node-http-request/src/executor.ts:8-28`).
- Medium/Low: wildcard CORS (`apps/api/src/index.ts:20-22`), unauthenticated realtime channel + unvalidated payloads, suppressed crashes (`:64-74`), silent failure paths.

### 1.6 Documentation contract gap
- `AGENTS.md:26` mandates `context/NEURON_RUNTIME.md`; file does not exist. `context/NEURON_ENGINE.md` (443 lines) exists but is ignored by `.gitignore:43` along with the other context docs; only `context/specs/landing-page-hero.md` is tracked. Build artifacts are correctly ignored and none are tracked.

---

## 2. Goals and non-goals

### Goals
1. Establish a real validation safety net (tests, typecheck, lint, CI) before structural change.
2. Fix Phase 0 security blockers with tests.
3. Introduce enforced module boundaries: transport → application → domain → ports → adapters → infra.
4. Make `@neuron/runtime` a pure engine with injected ports; no `@neuron/db` or editor-enum imports.
5. Consolidate duplicated orchestration/transform/branching/registry to one authoritative implementation each.
6. Replace the editor React context with Zustand stores (direct consumer migration), one owner per state slice.
7. Decouple `apps/web` from `@neuron/db`; remove dead code, duplicate dependencies, and broken scripts.
8. Bring UI in line with `context/DESIGN_RULES.md` semantic tokens (last phase).
9. Every completed task committed with a scoped message; evidence recorded in the ledger.

### Non-goals
- No new `@neuron/ports` package, CQRS bus, generic repositories, service locator, or `persist` middleware for editor state (rejected as over-engineering; see ADRs).
- No change to HTTP routes, response shapes, realtime channel/event strings, terminal response shape, retry schedule, Dexie draft identity, or webhook-data injection behavior (except filtering sensitive fields per T-105).
- No conversion of Theme/Auth/Vault/Sidebar/Dashboard/Workspace providers to Zustand in this program (future, separately justified).
- No database schema migration; all tasks are revertible single commits.
- No push to remote.

---

## 3. Proposed design

### 3.1 Backend (T-003 ADR)
Six layers: `transport` (routes/controllers) → `application` (new `apps/api/src/application/**` use-cases) → `domain` (pure `@neuron/runtime`, `@neuron/nodes`) → `ports` (`@neuron/shared/src/ports/**`, reusing existing `IVaultResolver`) → `adapters` (`@neuron/db`, `@neuron/auth`, realtime sink, Dexie) → `infra`.
Composition root: `apps/api/src/index.ts`. New ports: `WorkflowVariableSource`, `WorkflowEventSink`; three injected collaborators default to today's adapters so no caller changes initially.

### 3.2 Frontend (T-007 addendum, per user D-05)
Four Zustand stores under `apps/web/stores/workflow/**`:
- `graphStore` — graph, workflow metadata, globals, deployment, isDirty.
- `runtimeStore` — node status/outputs/errors, activeEdges, executions, logs (single owner; removes 3 duplicate representations).
- `uiStore` — panels via existing pure `editorUIReducer`, selection, live dialog booleans only.
- `asyncStore` — save/retry/loading/running/deploying/log-loading flags.

Pure `transitions/*` + exported `selectors.ts` (with `useShallow` at multi-field call sites). Dexie stays sole offline-draft owner behind `adapters/workflowDraft.ts`; no `persist` middleware. Side effects live in `adapters/workflowRealtime.ts`, `commands/workflowSync.ts`, `commands/workflowCommands.ts`, and `bootstrap/WorkflowSessionBootstrap.tsx`. `useWorkflowEditor.tsx` becomes a temporary shim with per-slice compile-time cutoffs and is **deleted** by the end of the phase. All 55–61 consumers migrate directly (AST inventory resolves the count in T-120).

### 3.3 Alternatives considered (rejected)
- Ports-only refactor: smallest diff but leaves god-module and duplicate orchestration (T-003 Alt A).
- New `@neuron/ports` package + CQRS: over-engineering with zero tests and no second implementation (T-003 Alt B).
- Keeping both engines behind a shim: preserves 3 competing node vocabularies and real divergence (T-003 consolidation alt).
- Keeping the React context split: explicitly overridden by user D-05 (T-007 Alt A).
- Big-bang consumer cutover: no per-slice rollback point (T-007 Alt B).
- Zustand `persist` for drafts: double-persist + SSR hydration risk (T-007 Alt C).
- Single mega-store: recreates the god object (T-007 Alt D).

---

## 4. Affected components / exact paths

| Area | Paths |
|---|---|
| Governance/contracts | `AGENTS.md`, `.gitignore`, `context/**`, `.agents/**` |
| Tooling/CI | `package.json`, `turbo.json`, `.github/workflows/**`, `packages/eslint-config/**`, `apps/web/eslint.config.mjs`, `apps/web/package.json`, `pnpm-lock.yaml` |
| API security | `apps/api/src/controllers/{deploy.workflow.controller,vault.controllers,workflow.controllers}.ts`, `apps/api/src/index.ts`, `apps/api/src/engine/execution.ts`, `apps/api/src/engine/node-registrys/**`, `packages/db/src/repository/{vault,deployed.workflow}.repository.ts`, `packages/db/src/services/VaultService.ts`, `packages/shared/src/utils/{secret,logger}.ts`, `apps/web/lib/utils.ts`, `packages/sdk/node-http-request/**` |
| Backend architecture | `packages/runtime/**`, `packages/shared/src/ports/**`, `apps/api/src/application/**`, `apps/api/src/adapters/**`, `apps/api/src/controllers/**`, `apps/api/src/engine/**` |
| Frontend Zustand | `apps/web/stores/workflow/**`, `apps/web/hooks/workflow/**`, `apps/web/providers/WorkflowEditorProvider.tsx`, `apps/web/app/(editor)/Provider.tsx`, `apps/web/components/workflow/editor/**`, `apps/web/constants/index.ts`, `apps/web/types/index.ts`, `apps/web/lib/graphMappers.ts` |
| Cleanup/decoupling | `apps/web/**` (15 `@neuron/db` imports), `apps/web/package.json`, `packages/nodes/**`, `apps/web/registry/**`, `apps/web/app/globals.css`, `apps/web/lib/utils.ts` |

---

## 5. Ordered implementation tasks

Phases are sequential; tasks inside a phase respect the dependencies shown. Every task has exactly one mutating owner and a disjoint lease. All tasks require a scoped commit.

### Phase A — Governance, safety net, and Phase 0 security (blocking)

| ID | Objective | Owner | Lease | Depends | Acceptance (observable) |
|---|---|---|---|---|---|
| T-100 | Resolve doc contract: repoint `AGENTS.md:26` to `context/NEURON_ENGINE.md`; force-add tracked context docs; fix `.gitignore:15` malformed negation | documenter | `AGENTS.md`, `.gitignore`, `context/**` | none | `AGENTS.md:26` names an existing tracked file; `git ls-files context` lists the docs; no dangling mandate |
| T-101 | Repair validation harness: real `check-types` for all 23 packages, `lint` (fix eslint-config `react-internal.js`, replace `next lint .` with `eslint .`), add Vitest + test task, wire `check-types/lint/test` into CI, align pnpm 9 | coder | `package.json`, `turbo.json`, `.github/**`, `packages/eslint-config/**`, `apps/web/{package.json,eslint.config.mjs}`, new test configs | none | `pnpm check-types` executes all packages and surfaces the real baseline errors (not a 1-package cache pass); `pnpm lint` exits 0; `pnpm test` runs ≥1 real passing test; CI runs all three. Typecheck becoming green is T-102's job. |
| T-102 | Fix all pre-existing type errors surfaced by T-101 in `apps/api`, `apps/web`, and shared/db sources without weakening checks | bugfixer | `apps/api/**`, `apps/web/**`, `packages/{shared,db}/**` (source only, no config) | T-101 | `tsc --noEmit` passes for every package; no `ignoreBuildErrors` relaxation; file:line evidence for each fix |
| T-103 | Replace `vm2` with `isolated-vm` (approved fallback: process isolation) on the live transform path; delete duplicate API copy | coder | `packages/sdk/node-transform/**`, `apps/api/src/engine/node-registrys/**`, manifests, new tests | T-101, security sign-off | No `vm2` import remains; sandbox tests prove timeout/no-require; `pnpm test` green |
| T-104 | Add `userId` scoping to vault + deployment repositories/controllers with negative authorization tests | bugfixer | `packages/db/src/repository/{vault,deployed.workflow}.repository.ts`, `apps/api/src/controllers/{vault.controllers,deploy.workflow.controller}.ts`, new tests | T-102 | Cross-user read/delete returns 404; tests cover both resources; live user-scoping paths unchanged |
| T-105 | Fix `VaultService.resolve` (always return decrypted plaintext), remove hardcoded client key, add logger redaction | bugfixer | `packages/db/src/services/VaultService.ts`, `apps/web/lib/utils.ts`, `packages/shared/src/utils/logger.ts`, new tests | T-102 | Contract test pins plaintext return; no fallback secret literal in web source; secrets redacted from logs |
| T-106 | Harden public execution: header-only key auth, strip credentials from `webhookData`, rate-limit route, zod-validate deployment payload, URL egress policy for HTTP node | coder | `apps/api/src/controllers/deploy.workflow.controller.ts`, `apps/api/src/index.ts`, `apps/api/src/engine/execution.ts`, `packages/sdk/node-http-request/**`, new validation schemas/tests | T-104 | No api_key query support; filter tests; SSRF tests reject private networks; frozen response shapes unchanged |
| T-107 | Independent security re-review of Phase 0 outcomes | security (read-only) | NONE | T-103..T-106 | Written sign-off that C-1, C-2, H-1..H-4 are resolved or explicitly accepted; no gate remains |

### Phase B — Backend boundaries (T-003 steps 2–5)

| ID | Objective | Owner | Lease | Depends | Acceptance |
|---|---|---|---|---|---|
| T-110 | Runtime ports: add `WorkflowVariableSource`/`WorkflowEventSink`, reuse `IVaultResolver`, inject three collaborators with current defaults; remove runtime→db and runtime→editor-enum imports | coder | `packages/runtime/**`, `packages/shared/src/ports/**`, `apps/api/src/adapters/**` | T-107 | Zero `@neuron/db`/editor-enum imports in `packages/runtime/**`; characterization tests pass; runtime behavior unchanged |
| T-111 | Realtime event adapter preserving exact channel/event strings + wire-contract tests | coder | `apps/api/src/adapters/**`, new tests | T-110 | Wire test asserts `workflow_<id>`, `workflow_action`, `workflow_runtime_action`, `NODE_EXECUTION_START/SUCCESS/ERROR`; visuals unchanged |
| T-112 | Application use-cases `ExecuteWorkflow` + deployment auth; consolidate two orchestration paths behind two response projectors; delete legacy engine wrapper | coder | `apps/api/src/application/**`, controllers, `apps/api/src/engine/execution.ts` | T-110, T-111 | Both HTTP behaviors preserved (202 vs terminal response project); one orchestration implementation; tests for both |

### Phase C — Zustand frontend migration (T-007 stages 0–5)

| ID | Objective | Owner | Lease | Depends | Acceptance |
|---|---|---|---|---|---|
| T-120 | AST-based consumer/dispatch-site inventory (read-only) reconciling 55 textual matches / 27 files vs "61" | explore (read-only) | NONE | T-101 | Exact list of every consumer + direct dispatch call site; count reconciled; report recorded |
| T-121 | Create four stores, pure transitions, selectors, adapters, commands, bootstrap; add exact `zustand@5.0.12`; characterization tests | coder | `apps/web/stores/workflow/**`, `apps/web/package.json`, `apps/web/lib/graphMappers.ts` | T-101, T-110, T-120 | Store/transition tests pass with no DOM; reset semantics distinct; debounce/retry schedule pinned; no new web→db imports |
| T-122 | Install temporary shim; swap `(editor)/Provider.tsx` to `WorkflowSessionBootstrap` | coder | `apps/web/hooks/workflow/useWorkflowEditor.tsx`, `apps/web/app/(editor)/Provider.tsx` | T-121 | Full characterization suite green; app renders and executes unchanged |
| T-123 | Migrate all consumers in per-slice batches A (UI), B (graph), C (runtime), D (commands/static data) with per-slice shim cutoffs | coder | `apps/web/components/workflow/editor/**`, `apps/web/hooks/workflow/**`, shim file | T-122 | Every consumer uses store selectors/actions; each cutoff compiles; no direct dispatch remains |
| T-124 | Delete shim, old provider, realtime hook and duplicate state; add CI gates (no context, no web→db, no `persist`, no `getState()` in components) | coder | `apps/web/**`, `.github/**` | T-123 | `useWorkflowEditor`/`WorkflowEditorContext`/`WorkflowEditorProvider` absent; CI gates pass; wire contract intact |

### Phase D — Cleanup, decoupling, and scale

| ID | Objective | Owner | Lease | Depends | Acceptance |
|---|---|---|---|---|---|
| T-130 | Delete dead legacy engine files and duplicate transform/branching/registry copies after importer verification | coder | `apps/api/src/engine/**`, `packages/nodes/**`, `apps/web/registry/**` | T-112, T-124 | Importer grep clean; single authoritative implementation each; build green |
| T-131 | Decouple 15 web files from `@neuron/db` to `@neuron/shared` contracts / `@neuron/client`; remove dependency | coder | `apps/web/**`, `apps/web/package.json` | T-124, T-110 | Zero `apps/web/** → @neuron/db` imports; CI gate enforces it |
| T-132 | Deduplicate `framer-motion`/`motion` and `reactflow`/`@xyflow/react`; fix broken `start`/`start:api` scripts | coder | `apps/web/package.json`, manifests, affected imports | T-101 | One library per family; `pnpm start*` paths resolve to emitted files; bundle evidence recorded |
| T-133 | Replace raw hex/Tailwind color utilities with semantic OKLCH tokens per `context/DESIGN_RULES.md` | coder | `apps/web/app/globals.css`, `apps/web/lib/utils.ts`, `apps/web/constants/index.ts`, affected components | T-124 | Zero raw-color violations in scoped paths; design rules checklist passes |
| T-134 | Harden process-level error handling, CORS allowlist, realtime payload validation/private channels | coder | `apps/api/src/index.ts`, `apps/api/src/adapters/**`, `packages/db/src/realtime/**`, web realtime adapter | T-107, T-111 | Fail-fast or documented degraded mode; explicit CORS origins; payload validation tests; wire strings unchanged |

### Phase E — Verification and sign-off

| ID | Objective | Owner | Lease | Depends | Acceptance |
|---|---|---|---|---|---|
| T-135 | Full verification: `pnpm check-types`, `pnpm lint`, `pnpm test`, `pnpm build`; architecture import-boundary checks; independent review; architect + security sign-off; final ledger/report/handoff update | coder + reviewer + architect + security (sequential sign-offs) | none (verification only) | All above | All checks pass with exact evidence recorded; no open defects; all commits recorded; definition of done met |

---

## 6. Parallelism and ownership

- Research and ADR phases are complete. Implementation phases A→E are sequential at phase level.
- Inside Phase A: T-100 ∥ T-101 (disjoint); T-102 depends on T-101; T-103 ∥ T-104 ∥ T-105 after T-102 (disjoint leases except T-104/T-106 both touch deploy controller → T-106 depends on T-104); T-107 gates Phase B.
- Phase B: T-110 → T-111 → T-112 (sequential; shared adapters/application folders); can overlap with Phase C T-120/T-121 (web-only lease) once T-107 passes.
- Phase C: T-120 → T-121 → T-122 → T-123 → T-124 (sequential; shared web files; overlapping consumer files get a single owner per batch).
- Phase D: T-130 ∥ T-131 ∥ T-132 after Phase C; T-133 depends on T-124; T-134 depends on T-107/T-111. Serialize any overlapping file via lease check in `.agents/ownership.yaml`.
- No two agents may hold overlapping leases; coordinator updates `.agents/ownership.yaml` before each dispatch.

## 7. Validation commands (exact)

- `pnpm check-types` — must execute all packages and exit 0 (after T-101/T-102).
- `pnpm lint` — must exit 0 (after T-101).
- `pnpm test` — must exist and exit 0 (after T-101).
- `pnpm build` — existing CI command; writes artifacts (only run in verification phase T-135).
- Per-package fresh typecheck: `pnpm exec tsc --noEmit --incremental false -p <package>/tsconfig.json`.
- Boundary checks (T-135): zero `@neuron/db` imports in `packages/runtime/**`; zero `apps/web/** → @neuron/db`; zero editor context symbols in `apps/web/**`; zero `persist` in `apps/web/stores/**`; zero `getState()/setState()` in React components.
- Wire-contract tests: channel/event literal assertions (T-111, T-124).

## 8. Migration, compatibility, security, performance, rollback

- **Compatibility**: frozen HTTP/realtime contracts listed in T-003 ADR invariants 1–12; internal context shape explicitly unfrozen (D-05). Two response projectors preserve 202 vs terminal responses.
- **Security**: Phase 0 blockers gate all structural work (D-02); ports carry `userId` as required; no secret logging; no api_key in URLs.
- **Performance**: Zustand selector subscriptions reduce re-render scope vs monolithic context; `useShallow` at multi-field sites; no `persist` double-write; isolated transform sandbox has timeout/memory limits; measure before dependency dedup.
- **Rollback**: each task is one revertible commit with no schema migration. Only wire-visible change candidates are T-106/T-111/T-124, each protected by contract tests.
- **Migration safety**: row→domain mapper (`positionX/Y` → `position`) is mandatory when swapping DB types for shared contracts; forgetting it breaks node positions.

## 9. Pre-existing errors and remediation mapping

| Defect | Remediation task |
|---|---|
| P-001 dangling `NEURON_RUNTIME.md` mandate | T-100 |
| No tests / no test runner / no test task | T-101 |
| Broken `pnpm lint` (missing eslint-config impl) and `next lint .` | T-101 |
| `check-types` covers 1/23 packages; hidden tsc errors in api/web/shared/db | T-101, T-102 |
| CI mislabeled, pnpm 8 vs 9, no lint/typecheck/test gates | T-101 |
| Broken `start:api` / `start` scripts | T-132 |
| `vm2` RCE path + duplicate | T-103 |
| Cross-user vault/deployment access | T-104 |
| `VaultService.resolve` wrong return + hardcoded client key + secret logging | T-105, T-106 |
| Unvalidated deployment payload + SSRF HTTP node + API key in query + credential logging | T-106 |
| Dead/duplicate engine, transform, branching, registry code | T-130 |
| 15 web→db imports | T-131 |
| Duplicate animation/flow dependencies | T-132 |
| 100+ design-token violations | T-133 |
| CORS `*`, crash suppression, unvalidated realtime payloads | T-134 |

## 10. Risks, assumptions, unresolved questions

- **Risk**: consumer count mismatch (55 textual/27 files vs 61) → T-120 AST inventory with compile-time cutoffs.
- **Risk**: two realtime pipelines converge on one runtime store — wire strings frozen; contract test mandatory.
- **Risk**: `resetNodeStatus` vs `resetFlowVisuals` clear different field sets — separate actions + tests.
- **Risk**: Dexie double-persist / debounce drift — Dexie sole draft owner; injected timers.
- **Assumption**: `isolated-vm` is acceptable for an exact dependency (native build); if unavailable, process isolation is the approved fallback (user/security decision recorded in ADRs).
- **Question**: out-of-repo consumers of provider-only dead fields or `@neuron/shared` editor enum — grep shows none in-repo; delete after final confirmation in T-124/T-130.
- **Question**: Supabase Realtime RLS/broadcast policies are remote config, not in repo — T-134 must verify with deployment owners.

## 11. Definition of done

- Every acceptance criterion in §5 verified with recorded evidence.
- `pnpm check-types`, `pnpm lint`, `pnpm test`, `pnpm build` all pass; boundary and wire-contract checks pass.
- Independent reviewer sign-off plus architect and security sign-offs recorded.
- All pre-existing defects in §9 remediated or explicitly user-approved with residual risk documented.
- Actual diffs inspected against leases; no user work overwritten; no accidental/generated/debug files.
- All changes committed with scoped messages; commit hashes recorded in `.agents/ledger.yaml`.
- Final `git status --short --branch` clean except intended untracked governance state; `.agents/reports/handoff-<timestamp>.md` written at handoff.

## 12. Commit expectations

- One focused commit per bounded task (§5), message format matching repo style (`refactor:`, `fix:`, `test:`, `docs:`, `chore:`).
- Governance/plan package committed as the first commit on the new branch.
- No amend/rebase/reset/force-push unless explicitly authorized. No push without explicit authorization.
