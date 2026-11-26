# T-137 review

- Reviewer: reviewer
- Status: approved
- Scope: `vitest.config.mts`, `.agents/reports/T-137.md`

## Acceptance
- API `@` alias resolves to `apps/api/src`.
- Web `@` alias resolves to `apps/web`.
- All 30 tests are included: 14 API, 11 web, 5 package.
- `pnpm test` — 30 files / 154 tests, exit 0.
- No skips, `.only`, `passWithNoTests`, or weakened assertions.

## Residual risks
- Node 20 remains below Vitest 5.1.1's declared Node 22.12+ engine; `Map.groupBy` can crash the reporter if a suite fails.
- Explicit per-project include globs mean tests outside the enumerated roots would need config updates.

## Next safe action
Commit T-137 and open a separate follow-up for Node/Vitest engine alignment.
