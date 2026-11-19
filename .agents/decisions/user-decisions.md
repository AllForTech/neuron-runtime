# User decisions for the refactor initiative (2026-11-19)

Recorded from explicit user answers via the question tool. These decisions override
research recommendations where noted.

| ID | Decision point | User choice | Consequence |
|---|---|---|---|
| D-01 | Compatibility policy | Preserve contracts, fix bugs | Freeze HTTP routes, response shapes, realtime channel/event strings, and execution behavior. Internal correctness/security fixes allowed. (The `useWorkflowEditor` context shape was later explicitly unfrozen by D-05.) |
| D-02 | Security handling | Phase 0 blockers | Critical security fixes and tests land before structural refactoring; they block acceptance. |
| D-03 | Missing runtime spec | Repoint AGENTS.md + track docs | Update AGENTS.md:26 to reference `context/NEURON_ENGINE.md`; force-add the `context/*.md` docs so the mandate is satisfiable and versioned. Fix malformed `.gitignore` negation if needed. |
| D-04 | Refactor scope | Full phased program | All phases in scope: safety harness, security blockers, runtime/application boundaries, Zustand frontend migration, dedup/dead-code removal, web→DB decoupling, tooling/CI, and design-token cleanup last. |
| D-05 | Zustand integration | Direct migration of consumers | Replace the editor React context with Zustand stores and migrate all consumers in-phase. HTTP/realtime contracts stay frozen; internal context shape is deleted, not preserved. Overrides T-003 D4, steps 6-7, invariant 13. |

## Notes

- D-05 supersedes the compatibility portion of D-01 that mentioned the `useWorkflowEditor`
  context shape. That context is an internal contract, not an external one.
- Architecture ADRs: `.agents/decisions/T-003-architecture.md`,
  `.agents/decisions/T-007-zustand-frontend.md`.
