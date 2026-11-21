# Decision — T-106 HTTP egress DNS rebinding

Date: 2026-11-21

## Context
T-106 added HTTP-node egress validation that resolves a target hostname and rejects private/loopback/link-local/reserved addresses. Security review found a high-severity DNS-rebinding TOCTOU: validation and the subsequent `fetch` resolve DNS independently, so a fast-flipping record could present a public address during validation and a private address at connect time.

## Decision
Implement connect-time IP pinning now. The HTTP node will connect to the already-validated public address via an undici dispatcher/agent while preserving the original URL hostname for the HTTP `Host` header and TLS SNI/certificate verification. Add a regression test that proves connect lookup uses the pinned address and ignores later/decoy DNS results.

## Alternatives rejected
- Accepting the TOCTOU as a documented residual with a follow-up task was rejected by the user because the egress boundary is security-sensitive.

## Constraints
- Preserve frozen HTTP response shapes, retry schedule, and realtime contracts.
- Revalidate every redirect target and pin each hop independently.
- Destroy per-request dispatchers to avoid socket/resource leaks.
- Keep all changes inside the T-106 lease.
