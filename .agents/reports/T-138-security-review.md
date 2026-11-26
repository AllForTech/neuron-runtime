# Security review — T-138

- Reviewer: security
- Status: approved
- Scope: apps/web/package.json, pnpm-lock.yaml, apps/web/next-env.d.ts, .agents/reports/T-138.md

## Verdict
Approve exact `next` and `eslint-config-next` 16.4.5. The previously selected 16.4.3 was rejected because seven GHSA advisories affecting it are patched in 16.4.5; 16.4.5 resolves those advisories.

## Verified controls
- Exact pins in `apps/web/package.json`; lockfile importer/resolution entries match 16.4.5 and retain integrity hashes.
- Installed modules match the lockfile: `next 16.4.5`, `eslint-config-next 16.4.5`, `happy-dom 21.0.4`.
- `pnpm audit --prod --json` reported no advisories for `next` or `eslint-config-next` and none of the seven rejected GHSA IDs.
- No audit suppression, new scripts, secrets, lifecycle hooks, tarball/git dependencies, or lint-rule weakening.
- `apps/web/next-env.d.ts` change is the generated `root-params.d.ts` import emitted by Next 16.4.5.

## Residual risks
- `pnpm audit --prod --json` still reports unrelated pre-existing advisories across other dependencies; outside this task and not introduced by this upgrade.
- Full audit excluding dev dependencies was not performed here.
- Ambient production environments remain subject to normal deployment review and monitoring.

## Next safe action
Record sign-off, reconcile ledger, and commit.
