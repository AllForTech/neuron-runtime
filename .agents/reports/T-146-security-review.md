# Security sign-off — T-146

- Owner: security
- Mode: read-only
- Status: APPROVE WITH CONDITIONS

## Verdict
T-146 reduced production risk without introducing a new critical/high advisory or supply-chain override. Merge is approved only with the conditions below.

## Verified
- Final production audit: 690 deps, 0 critical, 1 high, 12 moderate, 2 low.
- Baseline: 703 deps, 1 critical, 15 high, 16 moderate, 5 low.
- All 14 critical/high GHSA IDs from the T-146 change list are absent.
- No added overrides; existing dexie override is untouched.
- All specifier lines unchanged; in-range lockfile resolution only.
- All 58 added integrity hashes are sha512.

## Remaining high advisory
- GHSA-mwp4-54f8-5fhr, ip-address@10.1.0, fixed in >=10.3.1.
- Pulled by express-rate-limit@8.3.2 declared as ^8.3.2 in apps/api/package.json:28.
- This is a carried-over blocker, not fixed and not in T-146 scope.

## Conditions
1. Record a time-boxed explicit exception for this advisory before merge.
2. Keep remediation gated on T-147 with a named owner and release-blocker escalation.
3. Merge only pnpm-lock.yaml and the T-146 report; exclude unrelated governance/documentation changes from the dependency commit.

## Unverified
Baseline figures were not independently re-derived. Test/check/lint/build results are owner-reported and were not rerun under read-only mode. Tiptap editor paste/render was not manually exercised.
