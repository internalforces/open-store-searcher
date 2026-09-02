<!--
Purpose:        Define the reviewable pre-implementation TASK-006 transformation and identifier contract
Owner:          Architect / Researcher
Update Trigger: When TASK-006 evidence, identifier approval, or transformation boundaries change
Harness Version: 1.1
-->

# TASK-006 Transformation and Identifier Design

_Date: 2026-09-02_

_Status: Proposed — implementation and public-interface approval are pending_

## 1. Objective and approval boundary

This design prepares TASK-006 for review. It uses only the schema-level contract and evidence
accepted by TASK-005. It does not transform production records, implement a transformer or tests,
map statuses, derive `dataAsOf`, publish JSON, change a workflow, or settle a public URL format.

Human approval is required before implementation because the record contract is a data-contract
decision and any public identifier becomes a compatibility boundary for TASK-022 share URLs.
ADR-012 remains Proposed until that approval is explicit.

## 2. Accepted evidence and observed schema envelope

The accepted `src/pipeline/contracts/seoul-archive-contract.json` contains 195 categories. Every
category is EUC-KR CSV and includes the exact source headers `개방자치단체코드`, `관리번호`,
`사업장명`, `도로명주소`, `지번주소`, `영업상태명`, `영업상태코드`, `상세영업상태명`,
`상세영업상태코드`, `인허가일자`, `데이터갱신시점`, and `최종수정시점`.

The optional schema counts are evidence about header presence, not record completeness:

| Exact source header | Categories containing it |
|---|---:|
| `업태구분명` | 54 |
| `인허가취소일자` | 121 |
| `휴업시작일자` | 154 |
| `휴업종료일자` | 150 |
| `재개업일자` | 61 |
| `폐업일자` | 186 |

TASK-005 also accepts a category entry name, Public Data Portal file-data ID, exact ordered header
list, encoding, delimiter, timestamp-field list, Ministry provider label, permission label, and
structured archive/source retrieval evidence. No production row values were inspected for this
design. Header presence does not prove value syntax, semantics, uniqueness, stability, or
non-emptiness.

## 3. Proposed transformed record contract

The contract separates exact decoded source values from derived search values. `null` means the
source column is not present for that category or the source cell is empty, as distinguished by
the parser evidence described below. No display field is reconstructed from a search field.

```ts
interface TransformedLicenseRecordV1 {
  schemaVersion: 1;
  identity: {
    publicId: string; // exact format is unresolved and requires approval
    source: {
      categoryFileDataId: string;
      categoryEntryName: string;
      licensingAuthorityCode: string;
      managementNumber: string;
      providerServiceId: null; // not present in the accepted TASK-005 CSV schemas
    };
  };
  display: {
    businessName: string | null;
    roadAddress: string | null;
    parcelAddress: string | null;
    categoryName: string;
    businessTypes: Array<{ sourceField: string; value: string }>;
  };
  search: {
    normalizationVersion: 1;
    businessName: string | null;
    roadAddress: string | null;
    parcelAddress: string | null;
  };
  rawStatus: {
    operatingCode: string | null;
    operatingName: string | null;
    detailedCode: string | null;
    detailedName: string | null;
  };
  lifecycle: {
    licensedOn: string | null;
    licenseCancelledOn: string | null;
    suspendedFrom: string | null;
    suspendedThrough: string | null;
    reopenedOn: string | null;
    closedOn: string | null;
    sourceUpdatedAt: string | null;
    sourceLastModifiedAt: string | null;
  };
  provenance: {
    provider: '행정안전부';
    permissionLabel: '이용허락범위 제한 없음';
    sourceFileDataUrl: string;
    sourceFileDataId: string;
    sourceEntryName: string;
    sourceEncoding: 'euc-kr';
    fetchedAt: string;
    archiveSha256: string;
  };
}
```

### 3.1 Exact field mapping

| Output field | TASK-005 source evidence | Rule |
|---|---|---|
| `licensingAuthorityCode` | `개방자치단체코드` | Preserve decoded cell exactly as a string; required for identity |
| `managementNumber` | `관리번호` | Preserve exactly as a string; never parse as a number; required for identity |
| `businessName` | `사업장명` | Preserve exact decoded cell or `null` |
| `roadAddress` | `도로명주소` | Preserve exact decoded cell or `null` |
| `parcelAddress` | `지번주소` | Preserve exact decoded cell or `null` |
| `categoryName` | accepted entry name | Preserve the filename-derived category literal under the accepted category contract |
| `businessTypes` | category-specific approved header registry | Preserve each selected header name and exact cell; never conflate different source headers |
| raw status fields | four exact status headers | Preserve code and name independently; never map or repair a pair in TASK-006 |
| lifecycle dates | the six exact date headers above | Preserve the exact source string or `null`; parsing/validity rules require row-level evidence |
| source timestamps | `데이터갱신시점`, `최종수정시점` | Preserve separately; neither is `dataAsOf` |
| provenance | TASK-004/005 contracts and collector evidence | Copy structured evidence; do not derive it from record display values |

`businessTypes` is intentionally lossless and plural. Only `업태구분명` is currently evidenced
across 54 categories as an obvious common business-type header. Other category-specific headers
must enter a reviewed per-category mapping registry before implementation; similarity in Korean
wording is not enough to merge their semantics. The exact registry is an open question.

The CSV parser must retain whether a header is absent, a cell is empty, or a cell contains only
whitespace in its ingestion evidence. The public display value may use `null` for absent/empty
cells only after the parser rule is approved; the exact raw byte sequence is outside TASK-006
because TASK-005 supplies decoded schema contracts rather than row-level raw-byte evidence.

## 4. Search-only normalization v1

Apply the following algorithm independently to business name, road address, and parcel address:

1. If the source display value is `null`, return `null`.
2. Apply Unicode NFKC using the pinned Node.js runtime.
3. Apply locale-independent Unicode lowercase conversion.
4. Replace each maximal sequence of Unicode `White_Space` property characters with one ASCII
   space (`U+0020`).
5. Remove the leading or trailing ASCII space introduced by step 4.
6. Preserve the result even when it is empty, then reject a required searchable field according
   to the validation policy rather than borrowing another display field.

NFKC is acceptable only for search keys. Unicode explicitly warns that compatibility
normalization removes distinctions and must not be blindly applied to arbitrary display text.
The normalization version, pinned Node/Unicode behavior, and golden fixtures make upgrades
reviewable.

### Rules deliberately not applied

- Do not mutate, trim, normalize, lowercase, or replace the original display value.
- Do not remove punctuation, parentheses, hyphens, slashes, unit markers, or address numbers.
- Do not expand abbreviations, translate text, romanize Hangul, decompose Hangul, perform fuzzy
  correction, or reorder address/name tokens.
- Do not infer a missing road address from a parcel address or the reverse.
- Do not remove corporate markers, branch names, floor/unit detail, or category words.
- Do not use locale-sensitive sorting or case conversion.
- Do not normalize identity inputs. Identity uses exact source strings.
- Do not treat equal normalized values as equal businesses.

Search tokenization, scoring, ranking, and conflict handling belong to TASK-011 through TASK-013.

## 5. Content safety boundary

All source strings are untrusted text. The transformer must hold them as strings and serialize
them through the standard JSON serializer. Browser consumers must render them as text nodes or
ordinary Preact string children. `innerHTML`, `dangerouslySetInnerHTML`, HTML parsing, template
evaluation, URL execution, and script/style interpretation are prohibited. The transformer must
not sanitize by overwriting evidence; if later display escaping is needed, it occurs at the render
boundary while the exact display string remains available.

Control characters, invalid decoder output, unpaired surrogates, embedded NUL, and formula-like
prefixes are validation events. They must never be executed. The exact reject/escape policy needs
synthetic tests before production data is processed.

## 6. Official identity evidence

Official LOCALDATA administrator answers say:

- The provider treats the tuple of service ID (`opnSvcId`), licensing-authority code
  (`opnSfTeamCode`), and management number (`mgtNo`) as the key.
- A management number can repeat across industries/categories, so it must not be used alone.
- Within a license record, address, business type, or operating-state changes normally update
  fields while retaining the management number.
- Management-number formats are assigned by local authorities and can differ by authority and
  industry.
- Different key tuples remain distinct even when name, address, or phone values match; authority
  changes or transfers can also yield different keys.

This is evidence for source identity and relative stability, not an official guarantee that a raw
management number is intended as a permanent public URL token. The unrestricted Public Data
Portal permission supports reuse and modification of the selected datasets, but no current
official source found for this design defines a public identifier contract or promises that raw
keys will remain stable forever.

The accepted CSV schema has `개방자치단체코드` and `관리번호`, but no provider service-ID column.
TASK-005's `fileDataId` identifies a portal dataset and its entry name identifies an archive file.
No official evidence currently proves that either is identical to or a stable substitute for
`opnSvcId`. Therefore a provider-equivalent composite identity cannot yet be constructed from the
accepted inputs.

## 7. Public identifier alternatives

| Alternative | Inputs | Advantages | Risks / limits | Approval posture |
|---|---|---|---|---|
| Raw provider composite | `opnSvcId`, authority code, management number | Matches official provider identity guidance; debuggable | `opnSvcId` is absent; exposes source keys; URL escaping and future source changes become public compatibility issues | Unavailable now |
| Raw archive composite | file-data ID, authority code, management number | Available in all 195 schema contracts; deterministic | Not documented as provider identity; exposes raw keys; file-data ID stability is unconfirmed | Not recommended without official confirmation |
| Opaque hash of archive composite | versioned exact file-data ID, authority code, management number | Available, deterministic, does not print raw keys in URLs, fixed-length | Still inherits the unconfirmed category-identity substitution; hashing is pseudonymization, not proof of identity; format becomes permanent | Conditional recommendation after approval and validation |
| Repository surrogate registry | committed mapping from source evidence to assigned ID | Can survive a controlled migration | Requires stateful registry maintenance, review of every remap, and a publication design; conflicts with simple stateless transformation | Defer unless source identity cannot be made stable |
| Name/address-derived hash | normalized or display name/address | Available | Changes when descriptive fields change and collapses distinct licenses | Prohibited |

**Recommendation for approval:** keep the exact source tuple internally and use a full-length,
versioned SHA-256 digest of the exact archive composite only if the user accepts file-data ID as a
project category namespace rather than a claim of provider primary-key equivalence. Before that
decision, seek a current official mapping or statement for the service ID. Do not expose the raw
management number alone and do not derive identity from name, address, status, or dates.

This recommendation is deliberately conditional. The public prefix, textual encoding, digest
length, and share-URL placement remain unapproved public-interface choices.

## 8. Deterministic hash contract if the conditional option is approved

### 8.1 Input and encoding

- Algorithm: SHA-256 using the already approved Node.js native crypto capability.
- Domain separator: ASCII `open-store-searcher:public-license-id`.
- Contract version: unsigned 32-bit big-endian integer `1`.
- Fields in order: exact `categoryFileDataId`, exact `licensingAuthorityCode`, exact
  `managementNumber`.
- Each string: UTF-8 encoding of the exact decoded string, preceded by its unsigned 32-bit
  big-endian byte length. No Unicode normalization, trimming, number parsing, delimiter joining,
  or JSON object serialization is allowed.
- Hash the domain separator length/value, version, then each length/value pair.
- Retain the full 256-bit digest internally. A textual public representation is not selected here.

Length-prefixing prevents ambiguous delimiter collisions. UTF-8 and field order are part of the
versioned contract. RFC 8785 demonstrates why canonical encoding matters, but JCS is not adopted:
the fixed binary tuple is smaller and avoids property-order or serializer dependencies.

### 8.2 Collision and duplicate handling

- Maintain maps from exact source tuple to digest and digest to exact source tuple for the whole
  transform run.
- Reject a repeated exact source tuple even when every other row value is identical; silent
  deduplication could discard evidence.
- Reject a digest associated with two different exact tuples and preserve the staged input and a
  non-record diagnostic. Never append a counter, choose a winner, or publish either record.
- If a later public format truncates the digest, collision checks must operate on both the full
  digest and the public token. Truncation requires separate human approval and quantified risk.

### 8.3 Reproducibility and migration

Golden vectors must pin input code points, encoded bytes, and the full digest on every supported
platform. Any change to inputs, Unicode/decoder handling, binary framing, hash algorithm, or public
encoding creates a new identifier-contract version. Old IDs remain resolvable only through an
explicit TASK-022 migration/alias artifact; they must never be silently recomputed in place.
Version changes require a Proposed ADR, compatibility impact analysis, synthetic and migration
tests, human approval, and a major static-data schema version when existing public IDs change.

## 9. Fail-closed validation and deterministic output

| Condition | Detection | Required result |
|---|---|---|
| Missing category namespace, authority code, or management number | Distinguish absent header, empty cell, and whitespace-only cell before hashing | Reject the complete staged transformation; never substitute name/address or a row number |
| Duplicate exact source tuple | Whole-run tuple set | Reject; do not keep first/last and do not deduplicate |
| Digest/public-token collision | Reverse digest/token maps | Reject both colliding records and the complete artifact |
| Search normalization collision | Group distinct source identities by each normalized value and by the combined name/address search tuple | Preserve every record and emit deterministic collision evidence; never overwrite or merge. Publication waits for validator/search policies to accept collision metrics |
| Unicode boundary drift | Golden fixtures for NFC/NFD, compatibility characters, Hangul, emoji, combining marks, zero-width characters, and invalid surrogates | Reject on unsupported/invalid input; normalization-version change requires review |
| Whitespace boundary drift | Fixtures for ASCII space, tabs, CR/LF, NBSP, ideographic space, repeated and edge whitespace | Exact v1 expected outputs or failure |
| Output-order drift | Sort records by length-prefixed UTF-8 bytes of the exact identity tuple; compare serialized artifact hashes across shuffled inputs | Reject if shuffled input produces different bytes |
| Unknown column/mapping | Compare category headers and the business-type registry to the accepted TASK-005 schema contract | Reject category transformation until reviewed; never guess semantics |

Normalization collisions are not identity collisions. Common names and addresses can legitimately
repeat. Fail-closed behavior means retaining all distinct identities, making the collision visible,
and preventing map-key overwrite or auto-confirmation—not falsely deleting all repeated names.
Thresholds that permit production publication belong to TASK-009 validation and require evidence.

Properties in each JSON object must be emitted in the schema-defined order. Arrays use the exact
identity-byte ordering above. Diagnostics sort by code, category file-data ID, authority code, and
management number using the same byte comparator. Locale collation and source row order are never
part of canonical output.

## 10. Representative schema and synthetic test plan

### 10.1 Category selection

Before implementation, select a minimum synthetic matrix from the committed 195-category contract:

1. A category containing all common identity, name, address, status, six lifecycle, timestamp, and
   `업태구분명` headers.
2. A category without `업태구분명` and without at least one lifecycle header.
3. A category with a category-specific business-type candidate requiring an explicit mapping.
4. The approved literal filename-alias category to prove category identity is not generalized by
   punctuation normalization.
5. Categories at the minimum and maximum accepted header counts.

Selection must be computed from the schema contract, documented by entry name and file-data ID,
and must not inspect production rows. A category is excluded only when it adds no distinct schema
feature to this matrix; exclusion does not remove it from the eventual 195-category transform.

### 10.2 Synthetic fixtures and tests

- Exact preservation: leading/trailing whitespace, punctuation, HTML-looking text, quotes,
  backslashes, formula prefixes, emoji, and combining sequences remain exact in display fields.
- Search normalization: NFKC/lowercase/Unicode-whitespace golden pairs for each searchable field.
- Missing values: absent optional header versus empty and whitespace-only cells; required identity
  inputs reject.
- Identity: stable golden vectors, input-field order, UTF-8 framing, leading zeros, very long values,
  duplicate tuple, forced digest collision through an injected test hash, and shuffled input order.
- Categories: all selected mappings use exact header names; an unmapped candidate and a changed
  header reject.
- Status boundary: raw code/name pairs are byte-for-byte preserved; no processed status field exists.
- Time boundary: lifecycle and timestamp strings are preserved; no `dataAsOf` field exists.
- Safety: HTML-looking source remains inert text through JSON and a later component fixture.
- Determinism: repeated runs and all permutations of a fixture produce byte-identical records and
  collision diagnostics.

Implementation tests belong to the Node pipeline Vitest project and must remain fully synthetic.
`npm run test:pipeline`, `npm run verify:full`, and `git diff --check` are required after approval
and implementation, not evidence that this design itself implements TASK-006.

## 11. Ownership boundaries

| Task | Owns | Explicitly does not own here |
|---|---|---|
| TASK-006 | lossless display/evidence record, search-only normalization, internal source tuple, approved identifier algorithm, deterministic synthetic artifacts | production transformation or publication during the design phase |
| TASK-007 | exhaustive raw-to-display status mapping and unknown-code behavior | changing raw status evidence or identity |
| TASK-008 | conservative `dataAsOf` derivation and freshness evidence | treating `fetchedAt` or source timestamps as `dataAsOf` without its rule |
| TASK-009 | cross-record/schema/quality validation and publication eligibility | inventing identity or normalization rules |
| TASK-010 and later publication tasks | workflow integration, last-known-good replacement, static artifact publication | bypassing rejected transformations or validation |
| TASK-011 through TASK-013 | browser query normalization compatibility, matching, ranking, collision-aware candidate behavior | merging records by normalized value |
| TASK-022 | public share URL syntax, routing, legacy resolution, and compatibility migration | retroactively changing identifiers without approval |

## 12. Privacy, architecture, and operating constraints

- The pipeline produces static JSON only; runtime search remains entirely in the browser.
- No server, database, account, analytics, advertising, tracking, telemetry, or paid service is
  introduced.
- Search terms, clicks, location, and usage behavior are never collected, transmitted, or stored.
- No external real-time lookup or AI classification determines a record or status.
- Source identifiers are licensing-record identifiers, not proof that a business is open now and
  not a basis for inferring closure from a missing result.
- Hashing a source tuple does not anonymize underlying public data or permit unrelated personal
  data collection. Publish only fields approved for product display/evidence.

## 13. Public compatibility risk and change policy

Once a public identifier appears in static JSON or a share URL, bookmarks, search indexes, and
third-party links can depend on its exact bytes. An algorithm, input, namespace, truncation,
encoding, or prefix change is therefore a public-interface change even if the displayed record is
unchanged.

No such change may be made implicitly. It requires an ADR, human approval, a new version, collision
audit, reproducibility proof, compatibility/redirect strategy owned by TASK-022, and a published
migration window. The initial format should remain private until TASK-022 approves how URLs expose
it. TASK-006 may generate a candidate identifier in synthetic artifacts only after this design is
approved.

## 14. Open questions requiring approval or evidence

1. Can the current Public Data Portal or Ministry provide an official mapping from each accepted
   file-data category to the provider service ID used in the documented composite key?
2. If not, does the user approve treating `fileDataId` as a project category namespace for an
   opaque hash while explicitly avoiding a provider-primary-key claim?
3. Should the first public identifier expose a full SHA-256 encoding, and which prefix/encoding
   should TASK-022 adopt? No format is approved here.
4. Which category-specific headers qualify as business type or industry evidence, and what exact
   per-category registry is approved?
5. How should empty versus whitespace-only optional cells be represented after exact ingestion
   evidence is retained?
6. Which control characters and malformed decoder results reject an entire archive versus a row?
7. What production normalization-collision metrics are acceptable? TASK-009 must own the threshold.

## 15. Primary sources checked

The sources below were checked on 2026-09-02. The Public Data Portal, standards, and runtime pages
responded directly. The retired LOCALDATA Q&A pages returned errors on direct open, so their
official indexed page content was re-verified through current search results and cross-checked
against the previously accepted TASK-004 research. Those older answers remain the provider's most
specific published identity guidance but do not establish a new-portal public-ID guarantee. This
availability limitation is one reason the service-ID mapping remains an open question.

1. [Public Data Portal 2026 local administrative licensing service notice](https://www.data.go.kr/bbs/ntc/selectNotice.do?originId=NOTICE_0000000004709)
   — current migration scope and 195 categories.
2. [Official Q&A: management-number uniqueness and three-part key](https://localdata.go.kr/devcenter/bbs/devQnaDetail.do?bbsId=B0000100&menuNo=20003&nttId=1565&pageIndex=1&searchCnd=&searchWrd=)
   — management number stability under field updates and the three source-key fields.
3. [Official Q&A: repeated management numbers across industries](https://localdata.go.kr/devcenter/bbs/devQnaDetail.do?bbsId=B0000100&menuNo=20003&nttId=1677&pageIndex=12&searchCnd=&searchWrd=)
   — do not use management number alone.
4. [Official Q&A: management-number format varies](https://localdata.go.kr/devcenter/bbs/devQnaDetail.do?bbsId=B0000100&menuNo=20003&nttId=1697&pageIndex=10&searchCnd=&searchWrd=)
   — locally assigned, authority- and industry-dependent format.
5. [Official Q&A: source records are keyed independently of matching descriptive fields](https://www.localdata.go.kr/devcenter/bbs/devQnaDetail.do?bbsId=B0000100&menuNo=20003&nttId=1045&pageIndex=46&searchCnd=&searchWrd=)
   — identical name/contact evidence does not merge distinct key tuples.
6. [Public Data Portal use policy](https://www.data.go.kr/ugs/selectPortalPolicyView.do)
   — official permission framework; TASK-004 separately verified all 195 selected file pages.
7. [Unicode Standard Annex #15, revision 57](https://www.unicode.org/reports/tr15/)
   — Unicode 17.0 normalization definitions and warning about compatibility normalization.
8. [ECMAScript 2025 language specification](https://tc39.es/ecma262/2025/multipage/text-processing.html)
   — normative `String.prototype.normalize` behavior.
9. [NIST FIPS 180-4 Secure Hash Standard](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)
   — SHA-256 specification; NIST notes that a revision is planned.
10. [Node.js 24 crypto documentation](https://nodejs.org/download/release/v24.16.0/docs/api/crypto.html)
    — native SHA-256 hashing API in the approved runtime line.
11. [RFC 8785 JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785.html)
    — canonical encoding rationale and UTF-8 requirements; referenced, not adopted.

## 16. Approval choices

The reviewer and user should choose one identity direction before implementation:

- **A — seek provider service-ID evidence first (safest identity claim):** keep TASK-006 design
  open until the three-part provider key can be constructed.
- **B — approve the conditional opaque project identifier (recommended for progress):** accept
  `fileDataId` as a versioned project namespace, approve the full binary SHA-256 input contract,
  and defer its public text/URL form to TASK-022.
- **C — approve a repository surrogate registry:** accept state and migration complexity because
  the source namespace is insufficient.

Raw management number alone and name/address-derived identifiers are not valid choices.
