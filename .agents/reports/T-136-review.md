# T-136 review

- Reviewer: reviewer
- Status: approved
- Scope: `apps/api/package.json`, `apps/api/tsup.config.ts`, `pnpm-lock.yaml`, `.agents/reports/T-136.md`.

## Evidence
- Exact `isolated-vm@5.0.4` in manifest and lockfile.
- `external: ['isolated-vm']` at `apps/api/tsup.config.ts:18`; emitted ESM bundle keeps the runtime import.
- `pnpm build` 21/21, `pnpm test` 29 files/150 tests, `pnpm check-types` 21/21, `pnpm lint` 0 errors / 216 warnings.

## Notes
- One retained full-build log showed backend as Turbo cache replay; a fresh scoped backend build was run by the owner.
- Deployment must install dependencies so the native addon exists on the target Node ABI.

## Verdict
Approved; no T-136 code/config edits needed.
