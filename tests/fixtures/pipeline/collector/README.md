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

# Korean filename regression (TASK-008/009 continuation)

`korean-dos-utf8.zip` is a synthetic, single-entry, stored ZIP with DOS creator metadata,
UTF-8/data-descriptor flags 0x0808, and a Korean filename containing a space. These metadata
properties reproduce the official archive's observed filename boundary; no source row was
copied. The expected name is `가상_한글 자료.csv` and the entire UTF-8 body is the literal
`사업장명\r\n가상 업소\r\n`. Its owning adapter test requires exact filename/date and body
preservation. Update only when the supported ZIP filename contract changes.
