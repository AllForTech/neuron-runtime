# T-121a review

- Reviewer: reviewer
- Status: approved
- Scope: `apps/web/stores/workflow/**`, `apps/web/lib/graphMappers.ts`, `apps/web/package.json`, `pnpm-lock.yaml`, `.agents/reports/T-121.md`.

## Summary
The Zustand foundation is correct and safe to build on. The log-update bug was real: `transitions/runtime.ts:103` previously spread stale `...state.logs` after the patched entry, overwriting updates. The patch is now applied last, with regression tests that fail under the old order.

## Verification
- `pnpm test` → exit 0, 27 files / 140 tests.
- `pnpm check-types` → exit 0.
- `pnpm lint` → exit 0, 0 errors / 219 pre-existing warnings.
- Boundary grep → no `@neuron/db` import in `apps/web/stores/**` or `apps/web/lib/graphMappers.ts`.
- Original assertion retained; two new regression tests at `runtime.transitions.test.ts:107` and `:125`.

## Acceptance
- Exact `zustand@5.0.12` pin present.
- Distinct reset semantics, timing constants, arbitrary realtime action preservation, and DOM-free tests verified.
- No consumer/provider files changed.

## Non-blocking residuals
- Unused exported helpers likely for T-123.
- Legacy reversed-spread quirks in `addExecution` and `updateDeployment` preserved deliberately; decide at T-124.
- Object-returning selectors need `useShallow` when consumed in T-123.

## Next safe action
Record sign-off, commit T-111 and T-121, proceed to T-122.
