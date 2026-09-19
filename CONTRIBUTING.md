# Contributing

Thank you for helping improve `open-store-searcher`. Contributions should preserve the project's
core promises: static zero-cost operation, browser-only search, no behavior tracking, explicit
evidence and uncertainty, and fail-closed data publication.

## Before starting

Read [README.md](README.md), [Development and testing](docs/development.md), and
[Data, safety, and privacy](docs/data-and-safety.md). For changes to data delivery, status mapping,
external services, public URLs, workflow permissions, infrastructure, security behavior, or release
scope, open an issue first because those areas have explicit approval gates.

Do not include source archives, production datasets, secrets, tokens, `.env` files, personal data,
or real user search terms in issues, tests, commits, screenshots, or pull requests.

## Development workflow

1. Create a branch from current `main`.
2. Install the pinned toolchain with `npm ci`.
3. Keep the change focused and add meaningful regression coverage when behavior changes.
4. Run `npm run verify:full` before task completion. If the local platform cannot satisfy the
   Ubuntu/Info-ZIP collector contract, use the hosted `Verify` workflow without weakening or
   skipping assertions.
5. Update public documentation, traceability, and operational evidence when their claims change.
6. Open a pull request using the repository template and wait for required checks and review.

Use English for source, comments, public technical documentation, task records, and reports.
Preserve exact Korean product strings where their spelling is part of the behavior.

## Safety requirements

- Use only `행정상 영업`, `휴업`, `폐업`, and `확인되지 않음` as display statuses.
- Never describe `행정상 영업` as open now.
- Never infer closure from an empty result.
- Do not auto-confirm identical names when addresses conflict.
- Keep raw status, mapped status, source, and date evidence together.
- Never collect, persist, or transmit submitted search terms.
- Do not overwrite last-known-good data after a failed refresh.

## Pull requests

Explain the user-visible problem, the resulting behavior, the requirements affected, and the exact
verification performed. Mark production, hosted, mobile, accessibility, or recovery evidence as
unverified when it was not observed. A passing synthetic or local test must not be presented as a
production result.

By contributing, you agree that your code contributions are licensed under the project's MIT
License. Source data remains subject to its own provider terms.
