# Review — T-138

status: approved
scope: apps/web/package.json, pnpm-lock.yaml, apps/web/next-env.d.ts, .agents/reports/T-138.md
acceptance: met

## Findings

No findings against the four leased files. Every acceptance criterion from
`.agents/ledger.yaml:687` and every confirmation requested in the review brief is
satisfied by the evidence below.

## Acceptance criteria

- **next and eslint-config-next pinned to 16.4.5 — met** — `apps/web/package.json:68`
  is `"next": "16.4.5"` and `apps/web/package.json:93` is
  `"eslint-config-next": "16.4.5"`; both are exact (no `^`/`~`). The lockfile importer
  agrees: `pnpm-lock.yaml:247-248` (`next` specifier + resolved `16.4.5`) and
  `pnpm-lock.yaml:316-318` (`eslint-config-next` specifier + resolved `16.4.5`).
  Repo-wide scan found no `16.4.3` or `16.1.6` anywhere in `pnpm-lock.yaml`; every
  Next package/snapshot entry resolves to `16.4.5` (`pnpm-lock.yaml:1869-1920,
  4741, 6109, 8754-8788, 11711, 13330-13348`). Independently read installed versions
  from `node_modules`: `next 16.4.5`, `eslint-config-next 16.4.5`, `happy-dom 21.0.4`.
- **pnpm build exit 0 — met** — `.agents/reports/T-138.md:37` records `BUILD_EXIT_CODE=0`,
  `▲ Next.js 16.4.5 (Turbopack)`, 21/21 tasks. Not independently re-executed (read-only
  review; `next build` mutates tracked `tsconfig.json`), but the post-build restoration is
  verifiable: `git diff -- apps/web/tsconfig.json` is empty.
- **pnpm test exit 0 — met** — `.agents/reports/T-138.md:40` records `TEST_EXIT_CODE=0`,
  30 files / 154 tests passed. Not independently re-executed (read-only review).
- **pnpm check-types exit 0 — met** — `.agents/reports/T-138.md:41` records
  `CHECK_TYPES_EXIT_CODE=0`, 21/21 tasks. Not independently re-executed.
- **pnpm lint exit 0 — met** — `.agents/reports/T-138.md:42` records `LINT_EXIT_CODE=0`
  with `217 problems (0 errors, 217 warnings)`. Not independently re-executed.
- **apps/web/tsconfig.json restored after build — met** — `git diff -- apps/web/tsconfig.json`
  produced no output (exit 0), confirmed directly during this review.
- **No stale 16.4.3 / blocked / lint-failure claims in the four scoped files — met** —
  `.agents/reports/T-138.md:3` is `status: complete`; `:8-10` mention `16.4.3` only as
  historical, security-rejected state; `:27, :42, :54` state lint exits 0 with warnings
  only. No `blocked` status or `lint exit 1` claim remains in the report.
- **No rule suppression — met** — `git diff -- apps/web/eslint.config.mjs` is empty;
  no `eslint-disable`/TS-ignore markers exist in the scoped files (the only mentions in
  the report are narrative: `:9` explicitly rejects suppression as a trade-off).
- **No out-of-scope edits by foundation — met** — the lease at
  `.agents/ownership.yaml:30` and `.agents/ledger.yaml:690` covers exactly these four
  paths; `git diff` confirms only these paths carry the 16.4.5 upgrade, and every other
  modified path maps to the T-122/T-137/T-139 owners at `.agents/ownership.yaml:29,31`.
  `happy-dom` is preserved at `21.0.4` (`apps/web/package.json:94`, `pnpm-lock.yaml:5173,
  12302, 15066`) — no new dependency posture.

## Boundary and dependency notes

- `apps/web/next-env.d.ts:4` adds only the Next-generated
  `import "./.next/types/root-params.d.ts";` alongside the pre-existing `routes.d.ts`
  import. This is toolchain-owned output (the file says "should not be edited" at
  `:6`), consistent with 16.4.5's generator; it is not an authored source change.
- No dependency direction, module boundary, or layer responsibility changed — this is a
  pinned-version upgrade plus regenerated lockfile only.
- Governance metadata (`.agents/ledger.yaml:689,691,693`) is stale: `status: blocked`,
  evidence citing `16.4.3` and `pnpm lint exit 1`. This is outside the foundation lease
  and is explicitly disclosed by the implementer at `.agents/reports/T-138.md:57,61,64-65`
  as a coordinator reconciliation action. It does not invalidate the leased deliverable.

## Test assessment

- Covered at the correct boundary: four declared repo-level validation commands recorded
  with exit codes in the report; direct read-only corroboration of installed versions,
  lockfile pins, clean lint config, and clean `tsconfig.json`.
- No new unit tests were required for a dependency-pin change; the existing 154-test suite
  and 21-task build/type-check pipelines are the relevant regression gates.
- Missing: independent re-execution of build/test/check-types/lint by this reviewer. Exit-0
  claims are taken from the report's recorded outputs (`T-138.md:37,40-42`), not assumed,
  but were not reproduced here because the review is read-only and `next build` mutates a
  tracked file.
- No existing tests were skipped, weakened, or deleted by this task.

## Verification observed

- `git diff -- apps/web/package.json` — exact 16.4.5 pins for `next` and
  `eslint-config-next`; `happy-dom` unchanged at 21.0.4.
- `grep -nE '16.4.3|16.1.6|16.4.5'` over the four scoped files — `16.4.3/16.1.6` appear
  only as historical narrative in `T-138.md`; all code/lockfile values are 16.4.5.
- `grep -nE '16.4.3|16.1.6' pnpm-lock.yaml` — no output (no stale versions).
- `node -e` reading `apps/web/node_modules/*/package.json` — `next 16.4.5`,
  `eslint-config-next 16.4.5`, `happy-dom 21.0.4`.
- `git diff -- apps/web/eslint.config.mjs` — empty (no suppression/config change).
- `git diff -- apps/web/tsconfig.json` — empty (restored after build).
- `git diff -- apps/web/next-env.d.ts` — single generated import at line 4.
- `git diff --stat -- pnpm-lock.yaml` — `1 file changed, 508 insertions(+), 287 deletions(-)`,
  matching the report's `:44` figure.
- `pnpm build` / `pnpm test` / `pnpm check-types` / `pnpm lint` — **not observed first-hand**;
  evidence is the report's recorded exit codes at `T-138.md:37,40-42`.

## Residual risks

- Ledger/ownership governance state still describes T-138 as `blocked` on 16.4.3 with a
  lint failure (`.agents/ledger.yaml:689,691,693`). Coordinator must reconcile to the
  16.4.5 acceptance state; otherwise tooling that reads the ledger will misreport status.
- 217 lint warnings remain (report `:54`); warnings only, `pnpm lint` exits 0, no rules
  suppressed.
- `next build` rewrites `apps/web/tsconfig.json`; it was restored here but future builds
  will repeat the churn (report `:53`).
- Security sign-off for 16.4.5 is taken from the remediation brief; advisories were not
  independently enumerated in this review (report `:56`).

## Verdict

Approved for the four leased paths. Exact 16.4.5 pins are present in `package.json` and
the lockfile, installed modules match, the lockfile is free of the rejected 16.4.3/16.1.6
versions, `next-env.d.ts` contains only Next-generated output, lint config is untouched,
and no stale blocked/lint-failure claims remain in the report. All four validation commands
are evidenced as exit 0 in the report; this read-only review corroborated the surrounding
state but did not re-run them. Next safe action: coordinator reconciles
`.agents/ledger.yaml:689-693` (and ownership notes) from the stale blocked/16.4.3 state to
the verified 16.4.5 complete state, then completes normal sign-off/commit — no further
foundation code change is required.
