# open-store-searcher

`open-store-searcher` is a free, open-source static dashboard for searching Seoul business
licensing records by business name or address. It shows the administrative status recorded in
public data, the raw status evidence, the data date evidence, and uncertainty around the match.

> The current default build uses synthetic demonstration records. It is not a live business
> lookup service. Production publication remains disabled until the reviewed data-quality,
> baseline, hosted-performance, recovery, and release gates pass.

## What the result means

The interface uses four display statuses: `행정상 영업` (administratively operating), `휴업`
(suspended), `폐업` (closed), and `확인되지 않음` (unverified). `행정상 영업` does not mean a
business is open at the current moment. A missing result does not mean that the business is
closed. Always compare the address and raw evidence, check the displayed date, and verify
important decisions through another source or the business itself.

Search terms stay in the browser. The project adds no analytics, advertising, accounts, search
history, or telemetry. Selecting an external map link sends that result card's business name and
address to the selected map provider; it never sends the submitted search text automatically.
See [Data, safety, and privacy](docs/data-and-safety.md) for the full boundary.

## Quick start

Install Node.js 24.19.0 and npm 11.17.0, then run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The included records are clearly labeled synthetic examples.

On the approved Ubuntu 24.04 environment, run the standard verification before submitting a
change:

```sh
npm run verify
```

The full task-completion gate is `npm run verify:full`. The two production collector integration
tests require Ubuntu and Info-ZIP; use the hosted `Verify` workflow when the local platform cannot
run that gate. See
[Development and testing](docs/development.md) for commands, supported tooling, and repository
structure.

## Project status

- The browser search, uncertainty UI, accessibility flow, compact data reader, validation pipeline,
  and guarded GitHub Actions publication path are implemented and tested.
- The production build configuration and initial accepted baseline are intentionally absent.
- A 30-Seoul-calendar-day source calibration that began on 2026-09-17 remains in progress.
- No production Pages deployment or recovery exercise has been accepted.

The detailed operator sequence and open gates are in [Deployment and recovery](docs/deployment.md).
The data source, schema, status rules, date interpretation, and reuse terms are in
[Data, safety, and privacy](docs/data-and-safety.md).

한국어 안내는 [한국어 README](handbook/ko/README.md)에서 볼 수 있습니다.

## Contributing and security

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening a pull request. Report suspected security
problems using [SECURITY.md](SECURITY.md); do not put sensitive vulnerability details in a public
issue.

Code is licensed under the [MIT License](LICENSE). Public source data retains its own terms and
provenance; the code license does not relicense source records.
