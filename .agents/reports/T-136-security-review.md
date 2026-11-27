# T-136 security sign-off

- Reviewer: security
- Status: approved
- Scope: backend exact `isolated-vm@5.0.4` dependency, tsup externalization, lockfile.

## Controls verified
- No version drift; exact pin preserved in both manifests and lockfile.
- No install-script or `prebuild-install` change.
- No new trust boundary; sandbox execution unchanged.
- No checks weakened.
- Native-addon deployment requirement documented.

## Residual
- Native prebuild binary integrity remains the accepted T-103a residual.
- Target-ABI native addon load should be verified in staging.

## Verdict
Approved; no blocking findings.
