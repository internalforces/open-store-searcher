<!--
Purpose:        Bind PR 29 calibration receipts to implementation retained in main history
Owner:          Researcher / Reviewer
Update Trigger: When receipt provenance or observation implementation changes
Harness Version: 1.1
-->

# TASK-008 retained implementation binding — 2026-10-04

Related requirements: FR-08/13/14; approved TASK-008 calibration protocol.

## Retained anchor and scope

All ten PR #29 attempt receipts retain their original source-commit reference and additionally
bind their observation implementation to `a51479097c910862e0e63b3ed6d1e7e7fa477a85`, the
PR #28 merge already retained in `main`. Every input below is byte-identical between that anchor,
every recorded source commit, and PR #29 head `9a64996776b0759c20f3f207fd3ead18c39e6997`.
A clone of main can therefore inspect the observation implementation even after a later squash
merge removes the calibration branch. Original execution commits identify the historical run;
the anchor identifies equivalent implementation inputs, not a rerun or an identical whole tree.

The actual GitHub PR commit list and parent readback at review time retain all recorded source
commits as ancestors of `9a64996`. The squash-history premise in comment `4175812152` does not describe
the current remote branch history. The additional anchor also addresses that future
retention risk without rewriting source references or changing merge policy.

## Bound implementation inputs

Git object IDs identify recursive trees for `src` and `scripts`, and blobs for the other paths.
`src` includes the approved archive contract; the permission manifest is bound separately.
The observation entry point is `scripts/observe-seoul-quality.mjs`: it uses the source modules,
manifest, pinned dependencies and runtime settings below, and creates Vite with `configFile: false`.
Harness prose, later aggregate reports and `.gitattributes` diff-display settings are outside
this implementation binding. Runtime and external archive/log hashes remain in each receipt;
retaining this code does not prove provider freshness, production acceptance, or log availability.

| Input | Git object ID at retained anchor |
|---|---|
| `src` | `b52bca19355adcb39cc54b9f8fcac35665164014` |
| `scripts` | `759a7633df3c10014b09e4ff7a8aa1677aee9309` |
| `package.json` | `6877cd69a0683b2148c1212cab10c55298d18b90` |
| `package-lock.json` | `f5251b2f635b92e0a50423fae1f3d8ef1a561633` |
| `.node-version` | `60ade1ae01e833a5c291c47883bf26fb031f7727` |
| `.npmrc` | `13aa640e9f19f320897c39b2724be30dd023eeba` |
| `reports/source-permission-manifest-2026-08-28.json` | `933c8b9235d0eed7d59c852c2f060a34ba2b4d73` |

## Historical source references

| Attempt date | Original source commit (full ID) | Bound inputs vs retained anchor |
|---|---|---|
| 2026-09-22 | `a51479097c910862e0e63b3ed6d1e7e7fa477a85` | Identical |
| 2026-09-23 | `0ad74d998dccdf84ae7a5729d363aba5bdf01579` | Identical |
| 2026-09-24 | `1482b495adaec6afe969a641696644cbd63c6a35` | Identical |
| 2026-09-26 | `118d10f7ac2b1c42d370b69798ef6d81ed828f97` | Identical |
| 2026-09-27 | `16b0f4d6cfb191128653288eb86edfeffe1941c2` | Identical |
| 2026-09-28 | `eb3b8b6941e495499ca9a0d87d0c14b46d1675e5` | Identical |
| 2026-09-30 | `af35de1fa92f7af4b3d19109107ba877402b0cbc` | Identical |
| 2026-10-02 | `2a28952311e1ea31a25f87a0ee7002f3ed91303e` | Identical |
| 2026-10-03 | `ecf2083ab64600e3a3533fb6f715f602702d5c6f` | Identical |
| 2026-10-04 | `98d5d2a194856d4b99172af71c714f81995c71c5` | Identical |

## Reproduction

After fetching main and the PR branch, verify the anchor is retained:

```sh
git merge-base --is-ancestor a51479097c910862e0e63b3ed6d1e7e7fa477a85 origin/main
```

For each source commit in the table, the following comparison must produce no output:

```sh
git diff --name-only a51479097c910862e0e63b3ed6d1e7e7fa477a85 SOURCE_COMMIT -- \
  src scripts package.json package-lock.json .node-version .npmrc \
  reports/source-permission-manifest-2026-08-28.json
```

The same comparison against the final PR head checks that documentation remediation did not
alter the bound implementation. To inspect a bound tree or blob without the original source
commit, use `git ls-tree -r ANCHOR src scripts` or `git show ANCHOR:PATH`, replacing `ANCHOR`
with the retained full commit above and `PATH` with a listed input.

Validation on 2026-10-04: the retained-anchor ancestry check passed; all ten source comparisons
and the reviewed-head comparison were empty; all seven listed Git object IDs matched.
No source archive, production dataset, dependency, runtime configuration or workflow changed.
