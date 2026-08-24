# Test Fixture Rules

Shared fixtures live in a domain directory under `tests/fixtures/` only when a test consumes them.
Do not create empty fixture directories or infer the administrative-data schema before TASK-004
verifies the source contract.

Every fixture must be small, deterministic, and runnable without network access. Prefer synthetic
records and include only fields needed by the behavior under test. Exact Korean source values may
appear when their spelling is required by the assertion.

Document each fixture in its owning test or a sibling Markdown file with:

- Purpose
- Synthetic or approved source status
- Owning TASK ID
- Expected behavior
- Update trigger

Do not copy a full production export, include secrets or user-behavior data, or fetch external
content during a fixture test.
