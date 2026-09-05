// Research-only: run against a retained accepted archive in the approved Ubuntu environment.
// Arguments: pipeline root, search root, accepted collection JSON, new output directory.
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const [pipelineRoot, searchRoot, collectionPath, outputRoot] = process.argv.slice(2);
if (!pipelineRoot || !searchRoot || !collectionPath || !outputRoot)
  throw Error('four paths required');
const { createServer } = await import(
  pathToFileURL(resolve(pipelineRoot, 'node_modules/vite/dist/node/index.js'))
);
const server = await createServer({
  root: pipelineRoot,
  optimizeDeps: { noDiscovery: true, include: [] },
  configFile: false,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true, watch: null, ws: false },
});
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const districts = [
  '종로구',
  '중구',
  '용산구',
  '성동구',
  '광진구',
  '동대문구',
  '중랑구',
  '성북구',
  '강북구',
  '도봉구',
  '노원구',
  '은평구',
  '서대문구',
  '마포구',
  '양천구',
  '강서구',
  '구로구',
  '금천구',
  '영등포구',
  '동작구',
  '관악구',
  '서초구',
  '강남구',
  '송파구',
  '강동구',
];

try {
  const collection = JSON.parse(await readFile(collectionPath, 'utf8'));
  if (collection.kind !== 'accepted') throw Error('accepted collection required');
  const { parseCsvRows } = await server.ssrLoadModule(`${pipelineRoot}/src/pipeline/stream-csv.ts`);
  const { streamProcessBytes } = await server.ssrLoadModule(
    `${pipelineRoot}/src/pipeline/stream-process.ts`,
  );
  const { frameExactIdentityV1 } = await server.ssrLoadModule(
    `${pipelineRoot}/src/pipeline/transform-license-records.ts`,
  );
  const { projectSearchText } = await server.ssrLoadModule(`${searchRoot}/prepare-search-query.ts`);
  const getDistrict = (address) => {
    const found = [
      ...new Set(
        projectSearchText(address).addressTokens.filter((word) => districts.includes(word)),
      ),
    ];
    return found.length === 1 ? found[0] : null;
  };
  const { parseSearchAddress, compareSearchAddress } = await server.ssrLoadModule(
    `${searchRoot}/compare-search-address.ts`,
  );
  const contract = JSON.parse(
    await readFile(`${pipelineRoot}/src/pipeline/contracts/seoul-archive-contract.json`, 'utf8'),
  );
  const entry = contract.entries.find((entry) => entry.fileDataId === '15045016');
  if (!entry) throw Error('category missing');
  const { createReadStream } = await import('node:fs');
  const archiveHash = createHash('sha256');
  for await (const chunk of createReadStream(collection.archivePath)) archiveHash.update(chunk);
  if (archiveHash.digest('hex') !== collection.sha256) throw Error('archive hash mismatch');
  const memberHashes = [createHash('sha256'), createHash('sha256')];
  const memberSizes = [0, 0];
  const identities = new Set();
  const strata = new Map(districts.map((d) => [d, []]));
  const counts = Object.fromEntries(districts.map((d) => [d, 0]));
  const exclusions = { missingIdentity: 0, missingName: 0, missingAddress: 0, noSingleDistrict: 0 };
  const rowCounts = [0, 0];
  let projectedCount = 0;
  let peakRssBytes = 0;
  const start = Date.now();
  const checkBudget = () => {
    peakRssBytes = Math.max(peakRssBytes, process.memoryUsage().rss);
    if (Date.now() - start > 600000 || peakRssBytes > 2147483648)
      throw Error('research budget exceeded');
  };
  async function* readRows(pass) {
    async function* chunks() {
      for await (const chunk of streamProcessBytes({
        executable: 'unzip',
        args: ['-p', collection.archivePath, entry.entryName],
        maxBytes: 536870912,
        timeoutMs: 600000,
      })) {
        memberHashes[pass].update(chunk);
        memberSizes[pass] += chunk.byteLength;
        yield chunk;
      }
    }
    for await (const cells of parseCsvRows(chunks(), {
      encoding: entry.encoding,
      headers: entry.headers,
      maxBytes: 536870912,
      maxRows: 1000000,
      maxRecordChars: 65536,
    })) {
      rowCounts[pass]++;
      if (rowCounts[pass] % 10000 === 0) {
        global.gc?.();
        process.stderr.write(
          `${JSON.stringify({ pass, rows: rowCounts[pass], ids: identities.size, rss: process.memoryUsage().rss, heap: process.memoryUsage().heapUsed })}\n`,
        );
      }
      checkBudget();
      const value = (key) => cells[entry.headers.indexOf(key)];
      const authority = value('개방자치단체코드'),
        management = value('관리번호');
      if (!authority?.trim() || !management?.trim()) {
        if (pass === 0) exclusions.missingIdentity++;
        continue;
      }
      const id = hash(
        frameExactIdentityV1({
          categoryFileDataId: entry.fileDataId,
          licensingAuthorityCode: authority,
          managementNumber: management,
        }),
      );
      if (pass === 0) {
        if (identities.has(id)) throw Error('duplicate identity');
        identities.add(id);
        projectedCount++;
      }
      const name = value('사업장명'),
        roadAddress = value('도로명주소'),
        parcelAddress = value('지번주소');
      if ([name, roadAddress, parcelAddress].some((value) => typeof value !== 'string'))
        throw Error('projection headers missing');
      yield { id, name, roadAddress, parcelAddress, sourceRow: rowCounts[pass] };
    }
  }
  for await (const record of readRows(0)) {
    if (!record.name.trim()) {
      exclusions.missingName++;
      continue;
    }
    if (!record.roadAddress.trim() && !record.parcelAddress.trim()) {
      exclusions.missingAddress++;
      continue;
    }
    const district = getDistrict(record.roadAddress) ?? getDistrict(record.parcelAddress);
    if (!district) {
      exclusions.noSingleDistrict++;
      continue;
    }
    counts[district]++;
    const rows = strata.get(district);
    rows.push(record);
    rows.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : a.sourceRow - b.sourceRow));
    if (rows.length > 20) rows.pop();
  }
  identities.clear();
  const targets = [],
    background = [];
  for (const district of districts) {
    const rows = strata
      .get(district)
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : a.sourceRow - b.sourceRow));
    if (rows.length < 20) throw Error(`insufficient stratum ${district}`);

    targets.push(...rows.slice(0, 4).map((row) => ({ ...row, samplingDistrict: district })));
    background.push(...rows.slice(4, 20).map((row) => ({ ...row, samplingDistrict: district })));
  }
  if (new Set(targets.map((row) => row.id)).size !== 100) throw Error('targets not unique');
  const targetNames = new Set(
    targets.map((row) => projectSearchText(row.name).nameKey).filter(Boolean),
  );
  const targetAddresses = new Set(
    targets
      .flatMap((row) => [row.roadAddress, row.parcelAddress])
      .map((value) => projectSearchText(value).addressKey)
      .filter(Boolean),
  );
  const targetParts = targets.map((row) => ({
    name: projectSearchText(row.name).nameKey,
    address: parseSearchAddress(row.roadAddress.trim() ? row.roadAddress : row.parcelAddress),
  }));
  const selected = new Map([...targets, ...background].map((row) => [row.id, row]));
  let collisionRows = 0,
    partialCoreRows = 0;
  for await (const row of readRows(1)) {
    const name = projectSearchText(row.name).nameKey;
    const addresses = [row.roadAddress, row.parcelAddress];
    const collision =
      (name && targetNames.has(name)) ||
      addresses.some((address) => {
        const key = projectSearchText(address).addressKey;
        return key && targetAddresses.has(key);
      });
    let partialCore = false;
    if (!collision && name) {
      const similar = targetParts.filter(
        (target) => target.name && (name.includes(target.name) || target.name.includes(name)),
      );
      if (similar.length) {
        const parts = addresses.map(parseSearchAddress);
        partialCore = similar.some((target) =>
          parts.some((part) =>
            ['core', 'exact'].includes(compareSearchAddress(target.address, part).match),
          ),
        );
      }
    }
    if (collision) collisionRows++;
    if (partialCore) partialCoreRows++;
    if (collision || partialCore) selected.set(row.id, row);
    if (selected.size > 5000) throw Error('fixture corpus cap exceeded');
  }
  const memberSha256 = memberHashes[0].digest('hex');
  if (
    memberHashes[1].digest('hex') !== memberSha256 ||
    memberSizes[0] !== memberSizes[1] ||
    rowCounts[0] !== rowCounts[1]
  )
    throw Error('source changed between passes');
  const cases = targets.map((row, i) => ({
    id: `source-${String(i + 1).padStart(3, '0')}`,
    family: row.roadAddress.trim() ? 'source-road' : 'source-parcel',
    query: `${row.name} ${row.roadAddress.trim() ? row.roadAddress : row.parcelAddress}`,
    targetId: row.id,
    exact: true,
    forbiddenTopIds: [],
    primary: 'any',
  }));
  const records = [...selected.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const provenance = {
    kind: 'source-sample',
    description:
      'District-stratified 100-target general-restaurants snapshot from the approved Seoul archive; not all-category or population accuracy.',
    annotation:
      'Targets and full literal name-plus-address queries selected by framed identity hash before ranking; 4 per district, next16 background, complete name/address collision and partial-name core competitor closure.',
  };
  const corpus = { id: 'seoul-restaurants-source-v1', provenance, records, cases };
  const corpusBytes = JSON.stringify(corpus, null, 2) + '\n';
  const audit = {
    schemaVersion: 1,
    sourceUrl: 'https://www.data.go.kr/data/15045016/fileData.do',
    provider: '행정안전부',
    permission: '이용허락범위 제한 없음',
    permissionCheckedAt: '2026-09-05',
    fetchedAt: collection.fetchedAt,
    dataAsOf: null,
    archiveSha256: collection.sha256,
    memberName: entry.entryName,
    memberSha256,
    memberBytes: memberSizes[0],
    sourceRows: rowCounts[0],
    projectedRows: projectedCount,
    peakRssBytes,
    exclusions,
    stratumCounts: counts,
    targetCount: targets.length,
    backgroundCount: background.length,
    collisionRows,
    partialCoreRows,
    recordCount: records.length,
    corpusSha256: hash(corpusBytes),
    runtime: { node: process.version, icu: process.versions.icu },
    targets: targets.map((row) => ({
      id: row.id,
      sourceRow: row.sourceRow,
      district: row.samplingDistrict,
    })),
    backgrounds: background.map((row) => ({
      id: row.id,
      sourceRow: row.sourceRow,
      district: row.samplingDistrict,
    })),
    implementationSha256: {},
  };
  for (const path of [
    process.argv[1],
    `${pipelineRoot}/src/pipeline/stream-csv.ts`,
    `${pipelineRoot}/src/pipeline/stream-process.ts`,
    `${pipelineRoot}/src/pipeline/transform-license-records.ts`,
    `${searchRoot}/prepare-search-query.ts`,
    `${searchRoot}/compare-search-address.ts`,
  ])
    audit.implementationSha256[path] = hash(await readFile(path));
  await mkdir(outputRoot, { recursive: false });
  await writeFile(resolve(outputRoot, 'corpus.json'), corpusBytes, { flag: 'wx' });
  await writeFile(resolve(outputRoot, 'audit.json'), JSON.stringify(audit, null, 2) + '\n', {
    flag: 'wx',
  });
  console.log(
    JSON.stringify({
      sourceRows: rowCounts[0],
      records: records.length,
      targets: targets.length,
      exclusions,
      collisionRows,
      partialCoreRows,
    }),
  );
} finally {
  await server.close();
}
