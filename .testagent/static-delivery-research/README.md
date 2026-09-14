# Static delivery research probes

These are throwaway measurement probes, not a production codec, validator or adopted interface.
They require the complete hash-verified source received from the user in Downloads. They do not
fetch data, create an accepted baseline, change mapping, publish or use persistent browser storage.

Run from the reused task013-quality worktree with Node 24.19.0 and npm 11.17.0. Existing measured
output is retained at `/private/tmp/seoul-static-profile-20260914`; never overwrite it to rerun.

1. `node --max-old-space-size=4096 .testagent/static-delivery-research/profile.mjs NEW-DIRECTORY`
2. `node --max-old-space-size=4096 .testagent/static-delivery-research/index-profile.mjs NEW-DIRECTORY`
3. `node --max-old-space-size=2048 .testagent/static-delivery-research/shared-profile.mjs NEW-DIRECTORY`

The first probe validates the source hash, streams records, measures field contributions and
cardinalities, emits three candidate formats, reloads each block, and compares every reconstructed
record with its exact original JSON. It keeps global cardinality/identity sets for profiling only;
the production bounded producer must retain its disk-backed checks instead.

The second uses the existing search projection module to measure optional exact-key posting lists.
They are not a completeness-proven retrieval algorithm. The third compares global evidence
reference cost against local column cost and reconstructs every evidence value. Both require the
first probe's completed report. Serialization timings include encoding, gzip and read-back checks;
they are not browser preparation times. Runs were sequential to avoid cross-probe CPU contention.

`package-evidence.py` creates the one-shot research accounting site from the existing shell and
selected files using hard links, verifies all component hashes, reconciles field byte totals and
rechecks the input hash. It hardcodes the measured directory; adjust only its root for a new run
and build the current shell into that root's `shell` directory first. The site is not a functioning
compact-search UI and contains no accepted production baseline. Gzip sidecars are diagnostics and
are excluded from the accounting site. Do not deploy this research package.

See the feasibility report and proposed TASK-008 design for measured results and approval gates.
Research scripts were formatted and local names cleaned after execution. The shared-profile report
also distinguishes source distinct count from built dictionary entry count; data bytes are unchanged.


## Approved implementation verification

After the user approved the delivery design, these additional local research runners exercise
production code without creating approved policy/baseline/release state:

- `production-profile.mjs NEW-DIRECTORY`: verify the original source hash on each replay, call
  `writeCompactDataset`, verify all files/global IDs, and deeply compare every decoded record.
  Use Node 24.19.0 with `--max-old-space-size=2048`.
- `browser-profile.mjs PRODUCTION-PROFILE-DIRECTORY NEW-SITE-NAME`: build the actual compact UI,
  hard-link immutable data into a new research site, serve gzip on loopback and measure complete
  cold/warm preparation, visible searches, paging, failed refresh and old/new overlap. RSS is
  sampled process-tree accounting, not exact heap peak. The site is never publication-approved.
- `full-search-parity.mjs PRODUCTION-PROFILE-DIRECTORY`: compare all source records through the
  existing bounded-block oracle and new full store for district/name/address/absent queries.
  It asserts zero eligible matches for these probes before globally merging similar matches;
  the source-corpus and unit suites independently cover Top-3/eligible/tie cases. Use Node 24.19.0
  with `--max-old-space-size=4096`. All result fields and complete ordering are compared.

Do not infer production performance from the independent synthetic regression runner. Do not
reuse an existing site name or overwrite source artifacts. The authoritative English verification
report records exact commands, source hashes, measured limits and remaining production gates.
