<!--
Purpose:        Link unverified project information to placeholders and approval tasks
Owner:          Architect / Planner
Update Trigger: When an unresolved item is added, answered, approved, or discarded
Harness Version: 1.1
-->

# Open Questions — open-store-searcher

_Last updated: 2026-08-18_

Values that cannot be confirmed from the PRD and empty repository are not assumed. When an item below is decided, update the related placeholders across all linked documents.

| Question | Current placeholder | Decision location | Affected documents |
|---|---|---|---|
| Is the repository a single repository or monorepo? | [REPO_STRUCTURE] | ADR-004 / TASK-001 | AGENTS, project |
| What are the primary language and exact version? | [LANG], [VER] | ADR-004 / TASK-001 | AGENTS, standards, tech-stack, prompts |
| What are the static web framework and state-management approach? | [FRAMEWORK], [STATE_MANAGEMENT] | ADR-004 / TASK-001 | AGENTS, tech-stack, prompts |
| What are the package manager and test tools? | [PKG_MANAGER], [TEST_STACK] | ADR-004 / TASK-001 | commands, tech-stack, prompts |
| What are the indentation, line-length, and minimum-coverage standards? | [INDENT], [MAX_LINE_LENGTH], [MIN_COVERAGE] | TASK-002 through TASK-003 | standards |
| What are the development, verification, and build commands? | [*_COMMAND] in commands.md | TASK-002 through TASK-003 | commands |
| What are the Preview and Production URLs? | [STAGING_URL], [PROD_URL] | Deployment design | tech-stack |
| What are the source data's official download contract and authentication method? | Research required | TASK-004 | dependencies, architecture |

## Confirmed Answers

- Project name: open-store-searcher
- Project phase: new, pre-implementation
- Database: none; static JSON
- Infrastructure and CI/CD: GitHub Pages + GitHub Actions
- Code license: Apache-2.0
- Active roles: six core roles plus Tester, Documenter, Security Reviewer, Performance Engineer, and Release Manager
- Absolute constraints: zero-cost operation, static hosting, no collection of personal or usage data, no paid APIs/scraping/AI determination, and fail-safe status determination
- Harness documentation language: English only, except exact quoted product/source literals

