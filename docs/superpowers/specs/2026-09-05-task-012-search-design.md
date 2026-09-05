<!--
Purpose:        Define the proposed browser candidate matching contract for TASK-012
Owner:          Architect
Update Trigger: Human design review or implementation findings
Harness Version: 1.1
-->

# TASK-012: Candidate search and confidence

Date: 2026-09-05
Status: Accepted by the user on 2026-09-05; implemented, verified and independently Approved
Requirements: FR-03, FR-07; supporting FR-01, FR-02, FR-12; PRD 9.3–9.4

## Scope and alternatives

Recommend explicit address evidence and ordered match tiers. This makes every rank explainable
and lets conflict vetoes override name similarity. A weighted fuzzy score alone could let strong
name similarity hide a contradictory address. Candidate-dependent query splitting could interpret
the same query differently for each record and erase inconvenient address evidence. Neither is
recommended. No edit-distance matching, geocoding, inferred road/parcel conversion, new dependency,
public artifact schema, status mapping change, UI, or production publication is included.

TASK-011 remains the shared normalization boundary. Use `prepareSearchQuery` once for input and
`projectSearchText` for every query fragment and candidate field. Preserve original values.
The internal engine accepts readonly records containing an existing unique internal identifier,
name, road address, and parcel address, and returns references plus match evidence. This is an
in-memory adapter contract, not approval of the future public JSON schema.

## Mixed query interpretation

Interpret the query once, independently of candidates. Inspect whitespace-delimited words after
TASK-011 notation decoding and normalization, retaining contiguous source spans. Recognize address
anchors ending in the literal suffixes `"구"`, `"동"`, `"읍"`, `"면"`, `"리"`, `"대로"`,
`"로"`, or `"길"`; road/parcel anchors may carry an attached number. Require a nonempty prefix.
Recognize province tokens `"서울"` and `"서울시"` as search-only aliases of `"서울특별시"`.
These aliases do not change source values or TASK-011 projection output.

Use one contiguous address span made of recognized components, optional province, and an optional
immediately following building/lot number. A number is digits with at most one hyphen-separated
digit suffix; compare its entire normalized text, without dropping zeros or hyphens. The remaining
prefix or suffix is the name. Support name-first, address-first, and address-only inputs. Do not
extract a name from the middle of an address. Province alone is insufficient address evidence.

A road plus number, or locality plus lot number, is a strong address parse. District plus locality
is a partial address parse. A district or road/locality token alone is weak/ambiguous. Multiple
address spans, repeated conflicting components, unmatched numeric address tails, or words whose
field assignment remains uncertain produce an ambiguous interpretation. Such queries may retrieve
literal name/address matches, but every result is low confidence; do not select a best split by
score. A query with no address signal is name-oriented, with a literal address fallback at low
confidence. A full literal name comparison is retained for address-like business names, also at
low confidence if the query contains address ambiguity. Document supported syntax through fixtures;
this parser does not claim complete Korean address coverage.

## Exact, partial, and address evidence

Name exact means equal nonempty `nameKey` values. Name partial means one nonempty key contains
the other and the shared key has at least two non-space graphemes. No whitespace deletion,
synonym expansion, phonetic match, or typo correction is performed. An absent field never matches
another absent field.

Address exact means equal complete nonempty address token sequences after the explicit Seoul
alias substitution. Partial addresses require all supplied recognized components to agree within
one candidate address; never combine tokens from different addresses. Core evidence means either
district plus locality, or road plus building number, or locality plus lot number. A full address
containing extra detail may satisfy core matching without exact equality. Numeric components use
whole-token equality: `"12"`, `"120"`, `"12-1"`, and `"121"` are distinct.

Compare road queries to road addresses and parcel queries to parcel addresses. District evidence
can be compared across both fields; administrative locality names across road and parcel forms
are not assumed equivalent. Conflicts require comparable supplied and stored components:
different explicit districts; different roads in comparable road addresses; different localities
in comparable parcel addresses; or different building/lot numbers under the same road/locality.
Missing components or different address families mean unknown, not conflict.

If either stored address supports a match and the other contains a comparable explicit
contradiction, mark contradictory record evidence and force low confidence. A road/parcel text
difference alone is not a contradiction. Once a query carries address intent, evaluating a
name-only fallback must retain all address conflicts and ambiguity flags.

## Rank and confidence policy

Scores are ordinal tier labels, not probabilities or calibrated accuracy estimates.

| Tier / score | Evidence | Confidence without conflict or ambiguity |
|---|---|---|
| 1 / 500 | Exact name and exact complete address | High |
| 2 / 400 | Exact name and core address evidence | Medium |
| 3 / 300 | Partial name and core address evidence | Medium |
| 4 / 200 | Exact address and similar name evidence not already covered | Medium |
| 5 / 100 | Exact address only with a strong parse and no supplied mismatching name | Medium |
| 6 / 0 | Other literal name/address partial evidence, name only, incomplete address, or supplied-name mismatch | Low |

For this initial implementation, similar name means the same bounded substring rule as partial
name. Tier 4 is consequently subsumed by tier 3 when core evidence is also present; it is not a
separate fuzzy algorithm. Exact address with an absent candidate name can use tier 5, but explicit
supplied-name disagreement forces tier 6. The first five PRD preference statements remain ordered;
address-only handling is made explicit rather than fabricating name agreement.

Apply conflict and ambiguity vetoes before partitioning: any such flag forces low confidence
regardless of score. Name-only evidence is always low, even with one candidate. Never infer an
administrative status from match confidence, an absent candidate, or an address contradiction.

Sort eligible high/medium results by descending score, then existing internal identifier using
locale-independent string ordering. Return at most three in `topMatches`; return all low-confidence
candidates separately in `similarCandidates`, with conflict-free candidates before conflicts,
then descending score and identifier. Do not pad a short Top-3 with low-confidence candidates.
Expose eligible and similar counts. Equal-strength top candidates set `ambiguousTop`; expose a
`primaryMatch` only when the first result is high confidence and no other high-confidence candidate
has its score. Identifier ordering makes ties reproducible, not more certain.

Empty or too-short input returns TASK-011 validation without scanning records. Valid input with
no match returns empty arrays and no primary result. Invalid internal records are excluded with
aggregate diagnostics; ambiguous duplicate identifiers are excluded as a group rather than
selecting one according to input order. Do not merge distinct licensing records by name/address.

## Module and runtime boundaries

Keep query interpretation, address comparison, and rank/partition orchestration as small pure
modules under `src/search`, with colocated tests. Prepare a transient index once from supplied
records and scan it per query. Keep only the best three eligible candidates while counting all;
similar candidates may be sorted separately. No imports from Node/pipeline code, network APIs,
DOM parsing, storage, console logging, timers, or random tie-breaking. The caller owns static-data
loading. TASK-013 owns the realistic Seoul recall benchmark; TASK-018 owns full-data performance.

## Synthetic acceptance matrix

Each row requires concrete assertions before TASK-012 completion; this table is planned evidence.

| ID | Requirement | Required fixture assertions |
|---|---|---|
| S01 | TASK-011 reuse; FR-01/02 | Same normalization for query/record; Unicode, entities, punctuation; original values unchanged; invalid input never scans |
| S02 | Mixed interpretation | Name-first/address-first/address-only; attached numbers; name containing an address-like word; multi-span ambiguity cannot become high |
| S03 | Exact/partial; FR-03 | Exact-both before core/partial; name-only low; missing fields do not match; supplied mismatching name stays low |
| S04 | Address integrity; FR-03/07 | Same name plus different district, road, locality or number excluded from top and primary; fallback cannot remove conflict |
| S05 | Numeric boundaries | Separate assertions for 12 versus 120, 12-1 versus 121, Unicode hyphens, and missing versus conflicting numbers |
| S06 | Address families | Road/parcel match independently; no cross-field token union; alternate valid family is not a conflict; comparable contradictory evidence is low |
| S07 | Confidence; FR-07 | High/medium/low and reason codes; low returned only as similar; unique name-only candidate remains low; no status mutation |
| S08 | Top-3; FR-03 | 0/1/2/3/4 eligible records; no low-confidence padding; permuted input produces identical ordering; exact ties yield no primary |
| S09 | Invalid records | Malformed fields skipped; duplicate identifier group excluded; distinct licensing IDs never merged |
| S10 | Browser/privacy; FR-02/12 | Run engine in browser with network/storage/logging sentinels; no query I/O; imported browser dependency graph contains no Node modules |

Run focused new tests first, then pinned `npm run verify:full`, and obtain independent Reviewer
approval. Record exact test names and passing commands in the evidence report. Existing browser
shell smoke tests alone do not prove search execution or privacy. Synthetic passing results do
not establish the TASK-013 90% recall target or production readiness. No milestone closes here.

## Implementation evidence

Completed evidence: `reports/test-2026-09-05-task-012.md` and independent
`reports/review-2026-09-05-task-012.md`. The internal adapter preserves generic original-record
fields. The subsumed tier 4 has no dead implementation branch. Literal unclassified address
fallback allows partial text tokens at low confidence; tokens containing digits require whole-token
equality. These are implementation clarifications within the accepted conservative policy.

## TASK-013 verified extension — 2026-09-05

The TASK-013 completion request subsequently authorized targeted query/address interpretation
corrections, documented in the TASK-013 completion specification. That later contract supersedes
this document's blanket low-confidence treatment when an explicit province/known-district boundary
recovers an address-shaped name: such results cap at medium and cannot select a primary. Detailed
source addresses retain full keys while components distinguish units, numbered legal localities,
mountain qualifiers and parenthesized parcel evidence. Actual contradictions remain low-confidence
vetoes. Ordinal scores, Top-3 limit and status/source/public-identifier rules are unchanged.
