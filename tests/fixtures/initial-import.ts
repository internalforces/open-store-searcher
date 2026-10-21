import { readFileSync } from 'node:fs';
import type {
  InitialImportConfigV1,
  InitialImportRegistryV1,
  InitialSourceApprovalV1,
} from '../../src/pipeline/initial-import-types.js';
import { INITIAL_SOURCE } from '../../src/pipeline/initial-import-types.js';

/** TASK-009 II-01: approved config/observation plus synthetic transport IDs, never production authority.
 * Purpose: deterministic offline importer contracts. Update only after approved input changes.
 */
export function createInitialImportFixture(): {
  config: InitialImportConfigV1;
  registry: InitialImportRegistryV1;
  approval: InitialSourceApprovalV1;
  observation: unknown;
} {
  const config = JSON.parse(
    readFileSync(new URL('../../publication/config.json', import.meta.url), 'utf8'),
  ) as InitialImportConfigV1;
  const observation: unknown = JSON.parse(
    readFileSync(
      new URL('../../reports/observation-2026-10-16-bounded-source.json', import.meta.url),
      'utf8',
    ),
  );
  const { assetNames, ...source } = structuredClone(INITIAL_SOURCE);
  const approval: InitialSourceApprovalV1 = {
    ...source,
    releaseId: 101,
    tagCommit: 'a'.repeat(40),
    assets: {
      archive: { id: 102, name: assetNames.archive, ...source.archive },
      observation: { id: 103, name: assetNames.observation, ...source.observation },
    },
  };
  return {
    config,
    observation,
    approval,
    registry: {
      version: 1,
      kind: 'initial-source-approvals',
      repository: 'internalforces/open-store-searcher',
      siteUrl: 'https://internalforces.github.io/open-store-searcher/',
      activeSourceId: approval.id,
      sources: [structuredClone(approval)],
    },
  };
}
