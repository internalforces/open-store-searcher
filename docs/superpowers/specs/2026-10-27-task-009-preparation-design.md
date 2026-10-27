# TASK-009 lossless preparation optimization

Status: Execution authorized by the user's request to perform steps 2 and 3 and create a PR.
Requirements: FR-02/03/07/08/12/13/14; existing 500 ms search and complete-data performance gates.

Preserve the accepted compact data format, validation, row order, identity, scoring, evidence,
date/status semantics, cooperative cancellation and atomic accepted-result replacement. No
dependency, posting index, data-delivery, workflow, public URL, deployment or permission change.

Offline profiling reuses the hash-validated October 16 2,951,024-record snapshot. The baseline
finds repeated full text projections in name-only and address-component preparation, and sampled
retained allocation of about 508MB in address token splitting. Node 22 timings are compatibility
diagnostics, not pinned-browser/Worker/mobile acceptance. Inspector control overhead must not be
counted as application CPU. Preserve all original profile bytes and unprofiled repetitions.

Factor one-pass notation normalization and name-key projection from the existing full projection.
Address component parsing requests only the normalized token it actually uses. Keep all Unicode,
entity, punctuation, floor/unit and parenthesized-address rules identical.

Keep prepared addresses as AddressParts objects without duplicate wrapper/token arrays. For the
complete admission scan, evaluate literal address tokens against the same space-delimited key:
non-numeric tokens must occur inside a candidate token, numeric tokens must match an entire token.
Never allow a match across a space or a numeric substring. Materialize the original token arrays
only for admitted rows passed to the unchanged scoreCandidate function. No candidate is dropped
or capped, and the pure oracle remains unchanged.

Verify literal-key equivalence, specialized projections, complete all-page oracle parity,
cancellation/retry, complete real-source ordered vectors and full-field boundary pages. Establish
the fixed zero-candidate fixture against all records. Compare same-machine before/after profiles
and unprofiled samples; retain unchanged source/date/status evidence. Create a PR with measured
limits. Performance/publication/recovery and TASK-010 acceptance remain separate.
