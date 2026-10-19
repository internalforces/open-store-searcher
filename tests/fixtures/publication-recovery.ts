import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import contract from '../../src/pipeline/contracts/seoul-archive-contract.json' with {
  type: 'json',
};
import type { PublicationIdentityV1 } from '../../src/pipeline/recovery-types.js';
import { emptyMetric } from '../../src/pipeline/refresh-validation-metrics.js';
import { writeCompactDataset } from '../../src/pipeline/write-compact-dataset.js';

// TASK-009: two synthetic records, complete current category map, no production quality gates.
// Update when the approved archive/schema contract or V2 publication binding changes.
export async function createRecoveryFixture(): Promise<{
  root: string;
  siteDir: string;
  identity: PublicationIdentityV1;
  cleanup(): Promise<void>;
}> {
  const root = await mkdtemp(join(tmpdir(), 'publication-recovery-'));
  const siteDir = join(root, 'site');
  await mkdir(siteDir);
  const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
  const json = (value: unknown) => Buffer.from(`${JSON.stringify(value)}\n`);
  const records = ['a', 'f'].map((id) => ({
    id: id.repeat(64),
    name: `Synthetic ${id}`,
    roadAddress: '서울 강남구 1',
    parcelAddress: '',
    categoryName: 'synthetic.csv',
    businessTypes: [],
    rawStatus: {
      operatingCode: '05',
      operatingName: '제외/삭제/전출',
      detailedCode: '',
      detailedName: null,
    },
    processedStatus: '확인되지 않음',
    lifecycle: {
      licensedOn: '',
      licenseCancelledOn: null,
      suspendedFrom: '',
      suspendedThrough: null,
      reopenedOn: '',
      closedOn: null,
      sourceUpdatedAt: '',
      sourceLastModifiedAt: '',
    },
    sourceLabel: 'Synthetic fixture',
    sourceUrl: null,
  }));
  const compact = await writeCompactDataset(
    {
      archiveSha256: 'b'.repeat(64),
      policyRevision: 'synthetic-recovery-only',
      recordCount: 2,
      metadata: {
        sourceLabel: 'Synthetic fixture',
        sourceUrl: null,
        exampleQuery: '',
        coverage: { kind: 'collected', date: '2026-09-15' },
      },
    },
    async function* () {
      yield* records;
    },
    siteDir,
  );
  const metric = emptyMetric();
  Object.assign(metric, {
    recordCount: 2,
    unknownPairCount: 2,
    statusCounts: { '행정상 영업': 0, 휴업: 0, 폐업: 0, '확인되지 않음': 2 },
    aggregatePairs: [{ code: '05', name: '제외/삭제/전출', count: 2 }],
  });
  metric.rawMissing.parcelAddress.empty = 2;
  metric.rawMissing.detailedCode.empty = 2;
  metric.rawMissing.detailedName.null = 2;
  const categories = Object.fromEntries(contract.entries.map((e) => [e.fileDataId, emptyMetric()]));
  categories[required(contract.entries[0]).fileDataId] = structuredClone(metric);
  const schemaManifestSha256 = sha(
    Buffer.from(
      JSON.stringify(
        [...contract.entries]
          .sort((a, b) => a.entryName.localeCompare(b.entryName))
          .map((entry) => ({ ...entry, entryName: entry.entryName.normalize('NFC') })),
      ),
    ),
  );
  const baseline = {
    validationVersion: 1,
    schemaVersion: 2,
    identifierContractVersion: 1,
    normalizationContractVersion: 1,
    dateBasis: 'collection',
    dataAsOf: '2026-09-15',
    archiveSha256: 'b'.repeat(64),
    policyRevision: 'synthetic-recovery-only',
    schemaManifestSha256,
    evidenceReference: 'TASK-009 synthetic offline recovery fixture',
    metrics: { total: metric, categories },
  };
  const baselineBytes = json(baseline);
  const release = {
    version: 2,
    kind: 'validated-staging',
    dateBasis: 'collection',
    sourceDataAsOf: null,
    collectedAt: '2026-09-14T15:00:00.000Z',
    archiveSha256: 'b'.repeat(64),
    policyRevision: 'synthetic-recovery-only',
    recordCount: 2,
    warnings: [{ code: 'source_coverage_unverified', severity: 'warning' }],
    entries: [
      compact.manifestEntry,
      {
        name: 'baseline.json',
        byteLength: baselineBytes.length,
        sha256: sha(baselineBytes),
      },
    ],
  };
  await writeFile(join(siteDir, 'baseline.json'), baselineBytes);
  await writeFile(join(siteDir, 'release.json'), json(release));
  await writeFile(join(siteDir, '.nojekyll'), '');
  await writeFile(
    join(siteDir, 'index.html'),
    '<script type="module" src="./assets/app.js"></script>',
  );
  // Executing historical application code would create this file and fail the verifier test.
  await writeFile(
    join(siteDir, 'assets/app.js'),
    `import { writeFileSync } from 'node:fs'; writeFileSync(${JSON.stringify(join(root, 'executed'))}, 'unsafe');`,
  );
  await writeFile(join(siteDir, 'assets/worker.js'), 'self.onmessage = () => {};');
  return {
    root,
    siteDir,
    identity: {
      releaseSha256: sha(json(release)),
      manifestSha256: compact.manifestEntry.sha256,
      baselineSha256: sha(baselineBytes),
      archiveSha256: 'b'.repeat(64),
      collectedAt: release.collectedAt,
      recordCount: 2,
      policyRevision: 'synthetic-recovery-only',
      schemaVersion: 2,
      identifierVersion: 1,
      normalizationVersion: 1,
    },
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing synthetic fixture value');
  return value;
}
