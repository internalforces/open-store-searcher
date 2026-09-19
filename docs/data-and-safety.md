# Data, safety, and privacy

## Source and permission

The planned production source is the Seoul all-category archive for the Ministry of the Interior
and Safety's local administrative licensing data. The project audited all 195 selected category
pages on 2026-08-28. Each page identified the Ministry as provider and displayed
`이용허락범위 제한 없음` (unrestricted permission).

- [Public Data Portal](https://www.data.go.kr/)
- [Source transition notice](https://www.data.go.kr/bbs/ntc/selectNotice.do?originId=NOTICE_0000000004709)
- [Portal use policy](https://www.data.go.kr/ugs/selectPortalPolicyView.do)
- [Audited category manifest](../reports/source-permission-manifest-2026-08-28.json)
- [Source contract research](../reports/research-2026-08-28-source-data-contract.md)

The MIT license applies to project code. It does not replace the source data's permission terms,
provider identity, or attribution. Each published record retains category-specific provenance,
and the interface keeps source and date evidence visible.

## Published data shape

The pipeline retains the fields needed to identify and assess a result: source identifier,
business name, road and parcel addresses, category and business type, raw operating and detailed
status codes and names, licensing lifecycle dates, source modification fields, source label, and
source URL. Search projections are stored separately from display evidence.

Accepted releases use content-addressed compact assets. A release descriptor binds a compact
manifest and validation baseline. The manifest binds contract versions, collection metadata,
ordered record identity, byte lengths, SHA-256 hashes, and contiguous record blocks. The browser
validates the complete snapshot before making it searchable and retains the last accepted in-memory
snapshot when a replacement fails.

Source archives and intermediate rows are build inputs and are not part of the public site.

## Status and match interpretation

| Display status | Meaning |
|---|---|
| `행정상 영업` | The reviewed raw status maps to administratively operating. It does not mean open now. |
| `휴업` | The reviewed raw status maps to administratively suspended. |
| `폐업` | The reviewed raw status maps to administratively closed. |
| `확인되지 않음` | The status or match cannot safely be classified. |

The project does not infer closure from an empty search. Unknown or newly observed source status
pairs do not become operating, suspended, or closed automatically. Identical names with conflicting
addresses are not auto-confirmed. Low-confidence and similar candidates require the reader to
compare the address and raw evidence.

The search ranks the full eligible result set and shows a visible page of 20 similar candidates at
a time. Pagination changes only the visible page; it does not discard candidates or make a
query-dependent network request.

## Date evidence and freshness

The approved operating mode labels the completed archive collection date as `데이터 수집일`.
The original source coverage date is currently unverified. A collection date says when this project
finished collecting the archive; it does not say when each business was checked or when the source
provider's entire dataset became current.

The interface warns at an age of seven Seoul calendar days or more. Even a recent collection date
does not prove that a business is currently open. Use the record's raw dates and another source for
decisions that depend on current conditions.

The checked-in application currently uses synthetic demonstration data. Its example date and
records are not evidence about real businesses.

## Refresh failure policy

Collection, archive structure, decoding, row parsing, identifiers, status pairs, quality metrics,
resource limits, compact assets, and descriptor bindings must all validate before a candidate can
become publishable. A failed candidate must not replace the last known-good release or advance its
baseline. Scheduled runs never invent a baseline or bootstrap automatically.

Production thresholds, allowed-empty categories, and the first collection-date baseline remain
under the TASK-008 calibration and approval process. Until those values are reviewed, the required
`publication/config.json` stays absent and publication fails closed.

## Privacy boundary

The application processes submitted search text in the browser and adds no analytics, advertising,
cookies, accounts, persistent search history, or telemetry. The compact Worker loads the same
complete static snapshot independently of the search term.

When a reader selects a Naver Map or Kakao Map link, the application constructs a new search from
the displayed record's business name and address. That click sends those record fields to the map
provider under the provider's own terms. The original submitted query is not reused. Ordinary web
hosting and external sites may process request metadata under their own policies; this project does
not control those platforms.

## Disclaimer

This project presents public administrative records and search candidates. It does not provide
legal, regulatory, financial, or real-time operating advice. Confirm material decisions with the
source authority, the business, or another appropriate source.
