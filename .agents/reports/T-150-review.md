# Review — T-150

- Owner: reviewer
- Status: PASS

## Verdict
D1 and D6 foundations are correct. `selectSelectedNodeView` returns the required `{id, type, position, data}` view with `data = config + label`, and missing ids yield null. The single memoized `useReactFlowView` hook has stable references under equal state and invalidates on real changes.

## Scope
Leaked paths only: selectors.ts, selectors.test.ts, useReactFlowView.tsx, useReactFlowView.test.tsx. Shim and consumer files were untouched.

## Verification
Reviewer reran targeted Vitest: 22/22 passed. No weakened tests, suppressions, or out-of-lease edits.

## Next safe action
Record sign-off; consumers may import the selector and hook in T-123 batches.
