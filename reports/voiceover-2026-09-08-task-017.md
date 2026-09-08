# TASK-017 VoiceOver assisted verification — 2026-09-08

Status: Assisted manual matrix passed; independent closure review Approved.

## Method

Native macOS VoiceOver; synthetic built app served at loopback, Chrome. User authorized
execution and confirmed that actual VoiceOver audio was audible during the assisted session.
Native System Settings was observed off before the run and on after activation. CUA cannot
read the VoiceOver caption window or intercept its copy-last-phrase command. Therefore the
assistant operates the product while the user reports the actual heard speech. Native AX and
DOM observations remain supporting evidence, not substitutes for human speech observations.

The user explicitly agreed to participate in audio verification. Record both failures and
successful observations verbatim; no assumed confirmation and no silent checklist completion.

## Observation matrix

| Case | Product state / action | Human speech observation | Outcome |
|---|---|---|---|
| AT-01 | Input label and same-name query: eligible 0, similar 2, address/source guidance | User replied "들렸다" to the explicit question covering all three spoken items. | PASS (human observation) |
| AT-02 | Repeat same query without count changes | User replied "들렸다" after the explicit repeat search 4 / eligible 0 / similar 2 announcement question. | PASS (human observation) |
| AT-03 | Named candidate list, distinguishable addresses, status/raw/source/as-of reading | User replied "ㅇㅇ" to distinct spoken addresses and separately "ㅇㅇ" after reading the second candidate status, raw status, synthetic source and 2026-09-01 as-of date with VoiceOver. User additionally replied "ㅇㅇ" after the explicit VoiceOver reading question for the named candidate list and two items. | PASS (human observation) |
| AT-04 | Invalid input, correction and no-results non-closure guidance | User replied "ㅇㅇ" to the empty-input error and separately "ㅇㅇ" to no-results/non-closure/source-check speech. Native AX confirmed the prior error cleared on editing and input focus remained. | PASS (human speech plus supporting focus observation) |
| AT-05 | Ambiguous tie guidance | After restoring the visible retained Chrome tab and rerunning the tie query, user replied "잘 들려" to the explicit tie-guidance speech question. | PASS (human observation) |
| AT-06 | Loading, initial failure, retry, recovery and retained-data failure | User replied "ㅇㅇ" after explicitly reading the initial loading message with VoiceOver. User separately replied "ㅇㅇ" to the initial failure/unverified-state/retry guidance announcement. User replied "ㅇㅇ" to the successful retry announcement with one excluded record. Keyboard Enter initiated retry; AX confirmed retry-button focus during loading and after recovery (operator outcome control required restoring focus before completion). User replied "ㅇㅇ" to the retained-data failure announcement; AX confirmed the query and its one similar candidate remained available. | PASS (human speech with supporting AX observations) |
| AT-07 | Source/new-tab map link identity and no focus trap | User replied "ㅇㅇ" to the explicit instruction/question covering the source link, Naver/Kakao new-tab labels, and three Tab presses reaching the next candidate. | PASS (human observation) |

A temporary recovery page bundles the unchanged existing `tests/fixtures/recovery-runtime.tsx`
with existing pinned Vite/Preact dependencies. Operator buttons complete the existing pending
loader after three seconds. It is not production code or a new data delivery path. No query
leaves the local browser. Fixture setup is in `/tmp/task017-build-voiceover.mjs`; temporary
server bound loopback only. Cleanup and code hash verification are recorded below.

## Environment, scope and cleanup

macOS 26.6.2, built-in VoiceOver bundle version 10, Chrome 152.0.7977.77.
Implementation revision: 1acf77f894f77b45468de40441e29e1d2b5dd0ac.
The user provided actual speech observations in this conversation; no audio recording, caption
transcript, rotor test or other browser/screen-reader combination is claimed. Speech content
was confirmed; exact announcement latency was not measured. All seven matrix cases passed.
The recovery and map pages use unchanged repository fixtures with the same product components.
External link activation was not part of assisted testing; the existing automated suite tests
activation with local interception. No map provider was visited during this manual run.

A computer-use interruption closed the test tab. The first resumed tab was also unavailable
to the user; its unconfirmed speech was not counted. A visible retained tab was then restored,
and the user explicitly confirmed the rerun tie announcement before it was marked passed.

Native System Settings confirmed VoiceOver off after the final observation. The final test
tab was closed; earlier test tabs were already absent. Both loopback servers were stopped.
No implementation, test, dependency or configuration files changed during this follow-up.
The source/test/config SHA-256 manifest was rechecked for the current delivery state.
