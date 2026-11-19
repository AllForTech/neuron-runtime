# Handoff — planning phase complete (2026-11-19)

## Objective and scope
Research the Neuron Runtime codebase, produce a refactor/cleanup/modularization plan (module
boundaries, isolated logic, Zustand frontend state, security blockers, folder/file structure,
scalability), ask material questions, then create a dedicated branch. No source edits in this
phase. All research and ADR work performed by subagents; coordinator wrote only `.agents/**`.

## Contract reminder
Read `AGENTS.md` and `context/DESIGN_RULES.md` in full before acting. `AGENTS.md:26` references
missing `context/NEURON_RUNTIME.md` (P-001 → T-100).

## Branch / commits
- Base: `main` at `30c939e`.
- Work branch: `refactor/module-boundaries-cleanup`.
- Commit `f5a5150 docs: add refactor plan, architecture ADRs, and task ledger` — governance package only.
- Working tree clean after that commit; pending ledger/handoff edits to be committed as a small follow-up.

## Research agents (all read-only on source)
- T-001 `explore`: architecture/boundaries/flow map — chat report with file:line evidence.
- T-002 `explore`: quality/validation/security audit — chat report with exact command outcomes.
- T-003 `architect`: `.agents/decisions/T-003-architecture.md` (six-layer model, 13 invariants, 10-step migration).
- T-004 `security`: chat threat model; critical/high findings and must-fix prerequisites.
- T-006 `explore`: discrepancy verification (8/8 questions; context tracked set = 1 file; 0 tracked build artifacts).
- T-007 `architect`: `.agents/decisions/T-007-zustand-frontend.md` (context7-verified Zustand 5.0.12, four stores, staged direct-consumer migration).

## Verified facts (from agent reports)
- pnpm/Turbo monorepo; API controllers call DB repos directly; runtime depends on DB + editor enums.
- Zero tests; `pnpm lint` exits 2; `next lint .` dead in Next 16; check-types covers 1/23 packages; fresh tsc fails in api/web; CI builds only; pnpm 8 vs 9 drift.
- Critical security: vm2 RCE path, cross-user vault/deployment secrets, hardcoded client AES key, unvalidated/SSRF-capable execution path.
- `context/NEURON_ENGINE.md` exists (443 lines) but is ignored; `context/NEURON_RUNTIME.md` absent.
- Build artifacts correctly ignored; none tracked.

## Decisions
Recorded in `.agents/decisions/user-decisions.md`: preserve external contracts; security Phase 0 blockers; repoint AGENTS.md + track docs; full phased program; Zustand with direct consumer migration (overrides T-003 D4/steps 6-7/invariant 13).

## Plan and ledger
- Full plan: `.agents/reports/implementation-plan.md` (phases A–E, tasks T-100..T-135, acceptance, validation, rollback, DoD).
- Ledger: `.agents/ledger.yaml`; ownership map: `.agents/ownership.yaml`.
- T-001..T-004, T-006, T-007 done; T-005 done (commit f5a5150); all implementation tasks not_started.

## Parallelism / dependencies
Phases A→E sequential. A: T-100 ∥ T-101, then T-102, then security fixes, T-107 gate. B: T-110→T-111→T-112. C: T-120→T-121→T-122→T-123→T-124 (can overlap B after T-107 with web-only lease). D after C. No overlapping leases.

## Baseline / pre-existing errors
P-001..P-015 recorded in ledger with remediation task IDs. No pre-existing error fixed in this phase (planning-only). All remain open and are assigned.

## Open risks / questions
- Consumer count 55 textual/27 files vs 61 (T-120 AST inventory).
- `isolated-vm` native build availability (fallback: process isolation).
- Out-of-repo consumers of dead context fields / shared editor enum (confirm before deletion).
- Remote Supabase Realtime RLS/broadcast policies unknown (T-134).

## Next safe action
Commit the ledger/handoff update, then dispatch T-100 and T-101 in parallel with disjoint leases per `.agents/ownership.yaml` after recording exact leases in the ledger. Do not dispatch structural refactor tasks until T-107 security sign-off is recorded.
