# TASK-007 Test Plan

1. Add mapper tests before implementation: `maps the approved pair %s / %s`,
   `fails safely for aggregate combination %j / %j`,
   `rejects whitespace and Unicode variants of %s / %s`, and
   `does not read or mutate detailed evidence`.
2. Add transformer regressions: `preserves raw evidence while mapping %s / %s`,
   `versions processed output without changing identity, normalization, or ordering`, and
   `does not infer a status for an empty stage`.
3. Capture failing focused runs; implement the pure mapper and schema V2 integration.
4. Enforce exact file coverage thresholds and run focused unit and pipeline tests, then full verification.
5. Review assertions against ADR-013, record concrete results in `.testagent/status.md`,
   and update task, session, architecture, and traceability evidence.
