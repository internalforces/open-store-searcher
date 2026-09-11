<!--
Purpose:        Separate verified freshness statements from missing archive coverage evidence
Owner:          Researcher
Update Trigger: When provider documentation or confirmation supplies source-cut semantics
Harness Version: 1.1
-->

# TASK-008 Source-Cut Evidence Follow-up

FR-08, FR-13, FR-14. The decoder and research capacity corrections do not establish a production
data as-of date. No provider message was sent. This record prepares the remaining factual inquiry.

## Verified and unresolved

The official [eyeglass dataset page](https://www.data.go.kr/data/15045028/fileData.do) states
`"해당 데이터는 매일 갱신되는 데이터로 2일전 기준으로 현행화 됩니다."` The inspected HTML
therefore supports daily D-2 freshness intent. It does not identify a particular regional archive's
common source cutoff, generation timezone, or whether all 195 categories have the same coverage.

The [official maintenance notice](https://www.data.go.kr/bbs/ntc/selectNotice.do?originId=NOTICE_0000000004709)
identifies 195 licensing services. This is service coverage, not an archive-bound date guarantee.
Additional official-domain searches found a portal manual at
`https://www.localdata.go.kr/images/egovframework/portal/manual_260106.pdf`; both web extraction and
a 30-second direct fetch timed out. No contents from that unavailable document were assumed.

ZIP entry modification dates, download time, portal metadata update date and maximum row update
timestamp remain different facts. None is substituted for the common cutoff under ADR-014/015.
The async user question asks whether an authoritative provider document or reply is available.

## Concrete provider inquiry (draft only)

1. For the full regional Seoul ZIP delivered through the approved file service, does D-2 mean
   every category includes all changes through the end of the same Seoul calendar day?
2. Which timezone defines the generation date and the D-2 calculation? Is the archive/ZIP entry
   timestamp the generation time, an individual file update time, or the source cutoff itself?
3. Can categories have different coverage dates due to delayed upstream updates? If so, where is
   each category's guaranteed coverage date exposed, including header-only categories?
4. Which documented machine-readable metadata binds that date to a specific downloaded archive
   or generation identifier? Please identify the field/endpoint and its official semantics.

An answer must bind to the approved delivery contract. A different source or status policy is not
silently substituted. Once available, record the primary source, exact applicable categories,
timezone, and archive binding before constructing coverage evidence.

## Calibration boundary

A complete observation supplies initial counts, missing values and raw status-pair distributions.
A second download of identical bytes is not an independent sample of refresh variation. Production
count-change, missing-value and status-share limits require comparable complete observations over
an explicit interval and a reviewed rationale. Public serialized JSON size and its budget require
the agreed public representation. Until these gates pass, no production policy/bootstrap baseline
is accepted, TASK-008 remains active, and the user's sequential TASK-009 implementation is pending.
