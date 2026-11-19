# .agents Governance

This directory is the coordinator-controlled governance area for the Neuron Runtime
refactor initiative. It contains the task ledger, ownership/write-lease map, decisions,
and subagent reports.

## Rules

- `ledger.yaml` is the SINGLE source of truth for task state.
- Only the coordinator writes under `.agents/**`; the coordinator writes nowhere else.
- All source, test, config, build, and documentation edits are delegated to specialist
  subagents (`coder`, `bugfixer`, `documenter`) under explicit write leases.
- All codebase research is delegated to read-only `explore` subagents.
- No task is `done` until acceptance criteria are verified, evidence is recorded,
  required reviews pass, and changes are committed.

## Applicable project contracts

- Root `AGENTS.md` (read in full).
- `context/DESIGN_RULES.md` (read in full).
- `context/NEURON_RUNTIME.md` — **MISSING** but mandated by root AGENTS.md. Tracked as
  pre-existing defect P-001.
