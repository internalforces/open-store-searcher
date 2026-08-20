# Korean Human Handbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a curated Korean project handbook for people, exclude it from AI implementation context, and make its review part of every milestone close.

**Architecture:** Keep authoritative English harness documents in their existing locations and place human explanations under `handbook/ko/`. Enforce the boundary through the project constitution, workflow, role prompts, task routing, and verification rather than relying on a generic ignore file.

**Tech Stack:** Markdown, English AI Development Harness v1.1, Korean human-facing handbook

**Spec:** `docs/superpowers/specs/2026-08-18-korean-human-handbook-design.md`

## Global Constraints

- All harness metadata, headings, prose, tables, prompts, tasks, memory, and reports remain English-only.
- Korean explanatory prose is allowed only under `handbook/ko/`, which is not harness content.
- Implementation roles must not read, search, summarize, cite, or use `handbook/ko/**`.
- The Documenter may access the handbook only for milestone-close documentation or an explicit human handbook request.
- The PRD, accepted ADRs, active task, implementation, tests, and verification evidence remain authoritative.
- Handbook text must distinguish `행정상 영업` from real-time opening and must not infer closure from an empty result.
- Do not describe unresolved stack, source-data contract, or implementation details as completed facts.
- Do not add dependencies, services, deployment changes, or production writes.
- The workspace is not currently a Git repository; leave all changes uncommitted for the user to initialize and commit.

---

### Task 1: Register the Work and Establish Governance

**Files:**
- Modify: `tasks/active.md`
- Modify: `AGENTS.md`
- Modify: `ORCHESTRATOR.md`
- Modify: `roadmap.md`
- Modify: `tasks/backlog.md`
- Modify: `memory/decisions.md`

**Interfaces:**
- Consumes: approved handbook design and existing M0-M4 roadmap
- Produces: one active documentation task, constitutional access rules, milestone-close gate, recurring task routing, and an accepted ADR

- [x] **Step 1: Activate one handbook implementation task**

Add `TASK-025` to `tasks/active.md` with M0 scope, documentation-related requirements, explicit acceptance criteria, and verification commands. Remove any duplicate backlog row if present.

- [x] **Step 2: Define the constitutional boundary**

In `AGENTS.md`, state in English that `handbook/ko/**` is Korean human-facing output rather than harness content, prohibit implementation roles from reading or using it, allow limited Documenter access, and establish authoritative-source conflict handling.

- [x] **Step 3: Add the milestone-close workflow**

In `ORCHESTRATOR.md`, add a post-verification documentation pass and human Korean-language review before final milestone closure.

- [x] **Step 4: Add milestone gates**

In `roadmap.md`, add one handbook review or update condition to every M0-M4 milestone without changing product scope.

- [x] **Step 5: Route recurring work**

In `tasks/backlog.md`, add one reusable milestone-close handbook task and clarify that TASK-020 remains the v1.0 public-documentation task.

- [x] **Step 6: Record the accepted decision**

Add an accepted ADR to `memory/decisions.md` covering the repository boundary, authority rule, access prohibition, Documenter exception, and milestone update policy.

- [x] **Step 7: Verify governance coverage**

Run:

```bash
rg -n "handbook/ko|milestone.*handbook|Korean" AGENTS.md ORCHESTRATOR.md roadmap.md tasks/active.md tasks/backlog.md memory/decisions.md
```

Expected: every governance target contains the policy applicable to its responsibility, with no Korean explanatory prose.

### Task 2: Enforce the Boundary in Role Prompts

**Files:**
- Modify: `prompts/architecture.md`
- Modify: `prompts/debug.md`
- Modify: `prompts/implementation.md`
- Modify: `prompts/performance.md`
- Modify: `prompts/planning.md`
- Modify: `prompts/release.md`
- Modify: `prompts/research.md`
- Modify: `prompts/review.md`
- Modify: `prompts/security.md`
- Modify: `prompts/testing.md`
- Modify: `prompts/documentation.md`

**Interfaces:**
- Consumes: constitutional access policy from Task 1
- Produces: explicit per-role prohibition and a narrowly scoped Documenter exception

- [x] **Step 1: Update implementation-workflow roles**

Add one English rule to every non-Documenter prompt: do not read, search, cite, or use `handbook/ko/**`; use authoritative harness and verification sources instead.

- [x] **Step 2: Update the Documenter prompt**

Allow the Documenter to access `handbook/ko/**` only after milestone implementation, tests, and review are complete or after an explicit human handbook request. Require Korean text to be curated from verified outcomes and human-reviewed.

- [x] **Step 3: Verify prompt coverage**

Run:

```bash
for file in prompts/*.md; do rg -q "handbook/ko" "$file" || echo "missing:$file"; done
```

Expected: no output.

### Task 3: Create the Pre-M0 Korean Handbook

**Files:**
- Create: `handbook/ko/README.md`
- Create: `handbook/ko/project-overview.md`
- Create: `handbook/ko/architecture.md`
- Create: `handbook/ko/data-and-status.md`
- Create: `handbook/ko/search-and-ui.md`
- Create: `handbook/ko/operations.md`
- Create: `handbook/ko/glossary.md`
- Create: `handbook/ko/milestone-history.md`

**Interfaces:**
- Consumes: source PRD 1.0, ADR-001 through ADR-005, current project status, roadmap, and approved design
- Produces: a navigable Korean explanation of verified decisions and explicitly labeled planned behavior

- [x] **Step 1: Create the index**

Write the audience, non-implementation-input warning, Pre-M0 baseline, navigation, reading paths, current project state, and authority boundary.

- [x] **Step 2: Create the project overview**

Explain the problem, users, intended user flow, goals, non-goals, supported region, zero-cost model, privacy rules, and current Pre-M0 status.

- [x] **Step 3: Create the architecture explanation**

Explain the accepted static pattern and data flow while clearly stating that language, framework, repository structure, source contract, and concrete commands remain undecided.

- [x] **Step 4: Create the data and status explanation**

Explain source scope, exact four-status meanings, raw versus processed status, uncertainty, as-of dates, stale warnings, validation, and last-known-good behavior. Label source terms and exact mapping as unresolved research work.

- [x] **Step 5: Create the search and UI explanation**

Explain intended inputs, normalization, ranking, confidence, conflict handling, result evidence, empty-result behavior, accessibility, and external links. Mark the entire flow as planned rather than implemented.

- [x] **Step 6: Create the operations explanation**

Explain the accepted operational model, publication safety, privacy and security boundaries, recovery principle, current lack of runnable commands, and human approval gates.

- [x] **Step 7: Create the glossary**

Define exact product terms, data terms, architecture terms, confidence terms, and project-management terms without redefining authoritative rules.

- [x] **Step 8: Create the history**

Record the 2026-08-18 Pre-M0 baseline, accepted decisions, current limitations, and creation of the handbook. Include the required format for later milestone entries.

- [x] **Step 9: Verify handbook metadata and safety copy**

Run:

```bash
for file in handbook/ko/*.md; do
  metadata_lines=$(head -n 8 "$file" | rg -c '^> .+:')
  test "$metadata_lines" -eq 5 || echo "invalid metadata block:$file"
done
rg -n "행정상 영업|확인되지 않음|폐업을 의미하지" handbook/ko
```

Expected: no missing-metadata lines, and safety terminology appears in the relevant explanations.

### Task 4: Integrate, Close, and Verify the Documentation Work

**Files:**
- Modify: `docs/README.md`
- Modify: `docs/prd-traceability.md`
- Modify: `memory/project.md`
- Modify: `memory/session.md`
- Modify: `tasks/active.md`
- Modify: `tasks/completed.md`

**Interfaces:**
- Consumes: all completed changes from Tasks 1-3
- Produces: indexed design and plan, traceability evidence, project-state summary, completed task record, and final verification evidence

- [x] **Step 1: Update the harness index**

Link the design and implementation plan and describe the implemented handbook boundary without linking implementation roles into handbook content.

- [x] **Step 2: Update traceability and project state**

Record the milestone documentation gate and explain that the Pre-M0 handbook documents approved design and current limitations, not completed product features.

- [x] **Step 3: Complete the project task**

Move TASK-025 from `tasks/active.md` to `tasks/completed.md` with commands and evidence. Leave no other active implementation task.

- [x] **Step 4: Update the session handoff**

Record files changed, decisions, verification evidence, the Git-not-initialized limitation, and TASK-001 as the next product task.

- [x] **Step 5: Run full documentation verification**

Run a shell verification that checks expected files, prompt coverage, metadata, balanced code fences, absence of unresolved markers in the new design/plan/handbook, exact safety language, no Korean explanatory prose in changed harness documents beyond quoted literals, and no accidental secrets or environment files.

- [x] **Step 6: Review the final file set**

Run:

```bash
find handbook docs/superpowers -type f -name '*.md' -print | sort
git status --short
```

Expected: all design, plan, and handbook documents are present. `git status` is expected to report that the directory is not a Git repository, because the user will initialize and commit it later.
