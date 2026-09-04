# TASK-008 Test Plan

1. Record acceptance and create research/plan before production edits.
2. Helpers: tests first for V09 Seoul boundaries/calendar errors and V12 byte/UTF-8/JSON errors,
   capture red run, implement, and run narrow helper tests.
3. Validator: synthetic 195-category evidence fixture; tests first for V01-V08/V10-V11/V13,
   capture red run, implement typed boundary, metrics/policy, and result handling.
4. Add any uncovered concrete acceptance cases; use focused runs while resolving errors.
5. Run pinned full verification once implementation is stable, preserve existing thresholds.
6. Independently review behavior and assertions; fix findings, rerun affected gates, record
   exact names in reports and .testagent/status.md. Keep TASK-008 open for production evidence.
