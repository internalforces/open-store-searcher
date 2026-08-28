<!--
Purpose:        Document deterministic synthetic ZIP fixtures for TASK-005
Owner:          Tester
Update Trigger: When the archive adapter contract or fixture behavior changes
Harness Version: 1.1
-->

# TASK-005 Collector Fixtures

These fixtures are synthetic and contain no provider records.

- `valid-two-category.zip` contains two UTF-8 CSV files with fixed timestamps and minimal headers.
- `corrupt.zip` is a deliberately truncated copy and must fail archive integrity checks.

Regenerate them only when the TASK-005 archive-adapter contract changes. Preserve fixed entry
timestamps, sorted entry order, and metadata-free ZIP creation so byte output remains deterministic.
