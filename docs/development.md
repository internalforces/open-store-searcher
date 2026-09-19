# Development and testing

## Prerequisites

- Node.js 24.19.0
- npm 11.17.0
- Git
- Playwright-managed browsers for end-to-end or accessibility tests
- Ubuntu 24.04 and Info-ZIP `unzip` for the approved production collector path

Use the exact Node and npm versions from `package.json`. Do not install project packages globally.

## Local setup

```sh
git clone https://github.com/internalforces/open-store-searcher.git
cd open-store-searcher
npm install --global npm@11.17.0
npm ci
npm run dev
```

The development server renders synthetic fixtures. The repository does not contain a production
source archive, accepted production baseline, or production publication configuration.

For browser tests, install the pinned Playwright browsers after `npm ci`:

```sh
npx --no-install playwright install
```

On a clean Ubuntu runner, use `npx --no-install playwright install --with-deps`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a static build in `dist/`. |
| `npm run preview` | Preview the static build. |
| `npm run lint` | Run Biome linting with warnings treated as errors. |
| `npm run format:check` | Check formatting without changing files. |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm run test:unit` | Run unit tests. |
| `npm run test:pipeline` | Run pipeline tests. |
| `npm run test:component` | Run component tests. |
| `npm run test:coverage` | Run the coverage-gated Vitest suite. |
| `npm run test:e2e:full` | Run the desktop and mobile browser matrix. |
| `npm run test:a11y` | Run automated accessibility checks. |
| `npm run verify` | Run lint, formatting, types, coverage, build, and search-quality checks; production collector integration requires Ubuntu and Info-ZIP. |
| `npm run verify:full` | Run the task-completion gate: `verify`, the full browser matrix, and accessibility checks. |
| `npm run performance:check` | Check the bounded laboratory performance budgets. |

Run `npm run verify:full` before task completion. The production collector's two Info-ZIP
integration tests use the approved Ubuntu 24.04 environment and are expected to fail on an
incompatible local `unzip`; use the GitHub `Verify` workflow rather than weakening or skipping
their assertions. That workflow also runs the actual Pages artifact-packaging fixtures. Local
success does not replace hosted checks required by a pull request.

## Repository layout

```text
src/app/       Preact interface, data loading, recovery, and accessibility behavior
src/search/    Query preparation, ranking, compact-data search, and pagination
src/domain/    Exact administrative-status mapping
src/pipeline/  Collection, parsing, validation, staging, and compact publication
src/shared/    Shared data, freshness, and external-link contracts
scripts/       Verification, observation, staging, build, and measurement entry points
tests/         Browser, accessibility, quality, performance, and fixture support
publication/   Internal operator contract for reviewed publication inputs
docs/          Public guides plus project decision and traceability records
```

`handbook/ko/` is a separate human-facing handbook. It is not an implementation specification.
Follow `AGENTS.md` before using or changing it.

## Change discipline

Keep source-status mappings, data delivery, external services, workflow permissions, public URLs,
and deployment changes behind their recorded approval gates. Never add telemetry or persist search
terms. Do not commit source archives, generated production datasets, secrets, `.env` files, or
unreviewed publication configuration.

For code changes, add a focused regression that would fail before the fix when practical. Update
requirement traceability and operational documentation when behavior or evidence changes.
