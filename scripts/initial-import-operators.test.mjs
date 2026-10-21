import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({
  root,
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});
after(() => server.close());
const { createRecoveryFixture } = await server.ssrLoadModule(
  '/tests/fixtures/publication-recovery.ts',
);
const { verifyPublicationDirectory } = await server.ssrLoadModule(
  '/src/pipeline/verify-publication-directory.ts',
);
const { createRecoveryArchive } = await server.ssrLoadModule('/src/pipeline/recovery-archive.ts');
const { inventoryBytes } = await server.ssrLoadModule('/src/pipeline/recovery-types.ts');
const configPath = join(root, 'publication/config.json');
const registryPath = join(root, 'publication/initial-import-approvals.json');
const bind = (bytes) => ({
  byteLength: bytes.length,
  sha256: createHash('sha256').update(bytes).digest('hex'),
});
async function fixture(t) {
  const f = await createRecoveryFixture();
  t.after(() => f.cleanup());
  const verified = await verifyPublicationDirectory(f.siteDir);
  return {
    ...f,
    verified,
    output: join(f.root, 'prepared'),
    network: join(f.root, 'network'),
    events: join(f.root, 'events'),
  };
}
// Test-only source/module hooks replace costly source staging/build wiring, never product policy.
async function hook(f, options = {}) {
  const path = join(f.root, 'hook.mjs');
  const operator = {
    commit: 'c'.repeat(40),
    uncommitted: options.mode !== 'hosted',
    codeBindings: { 'scripts/synthetic-fixture.mjs': bind(Buffer.from('fixture')) },
    runId: options.mode === 'hosted' ? 31 : null,
  };
  const fixtureCode = String.raw`
    const fixtureData = ${JSON.stringify(f)}, fixtureOptions = ${JSON.stringify(options)};
    async function fixtureCode(use) {
      const f = fixtureData, options = fixtureOptions;
      return loadCurrentCode(async load => use(async name => {
        const real = await load(name);
        if (name === 'initial-import-approval' && options.active !== false)
          return {...real, selectInitialSourceApproval: () => ({id:'seoul-2026-10-16-initial'})};
        if (name === 'initial-source-download') return {...real,downloadInitialSource:async()=>{
          if(options.failure==='source')throw Error('fixture source failure');
          return {archivePath:'synthetic.zip',observationPath:'synthetic.json',transport:{kind:'github-release'}};
        }};
        if (name === 'stage-initial-source') return {...real,stageInitialSource:async(config,files,output,context)=>{
          appendFileSync(f.events,'stage\n');
          if(options.failure==='stage')throw Error('fixture stage failure');
          await cp(f.siteDir,output,{recursive:true});
          await writeJson(join(output,'source-import-receipt.json'),{private:true});
          await writeFile(join(output,'input.zip'),'synthetic raw archive');
          await writeJson(join(output,'observation.json'),{raw:true});
          if(options.race){await mkdir(f.output);await writeFile(join(f.output,'sentinel'),'competitor');}
          return {stageDirectory:output,receipt:{version:1,kind:'retained-source-import-verified',sourceId:'seoul-2026-10-16-initial',mode:context.operator.runId===null?'local-proof':'hosted',operator:context.operator,collectedAt:f.verified.collectedAt,archive:{sha256:f.verified.archiveSha256},recordCount:2,policyRevision:f.verified.policyRevision,transport:files.transport,...options.receiptPatch}};
        }};
        if(name==='verify-publication-directory' && options.failure==='inspection')
          return {...real,verifyPublicationDirectory:async()=>{throw Error('fixture inspection failure')}};
        if(name==='recovery-archive' && options.failure==='archive')
          return {...real,createRecoveryArchive:async()=>{throw Error('fixture archive failure')}};
        return real;
      }));
    }
    const actualRun = promisify(execFile);
    async function fixtureRun(file,args,opts){
      const f=fixtureData,options=fixtureOptions;
      if(file===process.execPath && !options.realBuild){
        appendFileSync(f.events,'build\n');
        if(options.failure==='build')throw Error('fixture build failure');
        await cp(f.siteDir,args[2],{recursive:true});return {};
      }
      if(options.failure==='tar')throw Error('fixture tar failure');
      return actualRun(file,args,opts);
    }
  `;
  await writeFile(
    path,
    String.raw`
    import {registerHooks} from 'node:module';
    import {readFileSync,appendFileSync} from 'node:fs';
    const f=${JSON.stringify(f)}, options=${JSON.stringify(options)};
    globalThis.fetch=async()=>{
      appendFileSync(f.network,'fetch\n');
      if(options.networkFail)throw Error('fixture transport failure');
      const n=readFileSync(f.network,'utf8').trim().split('\n').length;
      return new Response(null,{status:(n===1?options.firstStatus:options.finalStatus)??404});
    };
    registerHooks({load(url,context,next){
      const result=next(url,context);
      if(!url.endsWith('/scripts/initial-import-support.mjs'))return result;
      let source=String(result.source)
        .replace('const run = promisify(execFile);','const run = fixtureRun;')
        .replaceAll('await operatorIdentity(request.mode)',${JSON.stringify(options.actualIdentity ? 'await operatorIdentity(request.mode)' : JSON.stringify(operator))})
        .replace('loadCurrentCode(async (load) =>','fixtureCode(async (load) =>');
      source="import {appendFileSync} from 'node:fs';import {cp,mkdir,writeFile} from 'node:fs/promises';\n"+source+${JSON.stringify(fixtureCode)};
      if(options.manifestPath)source=source
        .replace("if (!(await statOrAbsent(join(root, '.git'))))",'if (true)')
        .replace("join(root, '.initial-import-local-code.json')",JSON.stringify(options.manifestPath));
      if(options.failure==='cleanup')source=source.replace('await rm(stageDirectory,','throw new Error("fixture cleanup failure"); await rm(stageDirectory,');
      return {...result,source};
    }});
  `,
  );
  return path;
}
function run(f, preload, mode = 'local-proof', args, cwd = root, env = {}) {
  const script = mode === 'hosted' ? 'stage-initial-import' : 'verify-initial-import';
  return spawnSync(
    process.execPath,
    [
      '--import',
      preload,
      join(root, `scripts/${script}.mjs`),
      ...(args ??
        (mode === 'hosted'
          ? [configPath, registryPath, 'seoul-2026-10-16-initial', f.output]
          : [configPath, join(f.root, 'input.zip'), join(f.root, 'observation.json'), f.output])),
    ],
    { cwd, encoding: 'utf8', timeout: 30000, env: { ...process.env, ...env } },
  );
}
async function rejected(f, result, expected) {
  assert.equal(result.status, 1, result.stderr);
  if (expected) assert.match(result.stderr, expected);
  await assert.rejects(access(f.output));
  assert.equal(
    (await readdir(f.root)).filter((n) => n.startsWith('.prepared.operator-')).length,
    0,
  );
}
test('synthetic local wiring packages complete receipt bindings with zero network and null hosted authority', async (t) => {
  const f = await fixture(t),
    before = await readFile(configPath),
    workflowOutput = join(f.root, 'github-output');
  const result = run(f, await hook(f), 'local-proof', undefined, root, {
    GITHUB_OUTPUT: workflowOutput,
  });
  assert.equal(result.status, 0, result.stderr);
  const p = JSON.parse(await readFile(join(f.output, 'preparation.json')));
  assert.equal(p.mode, 'local-proof');
  assert.equal(p.precondition, null);
  assert.equal(p.operator.runId, null);
  assert.equal(p.operator.uncommitted, true);
  assert.equal(Date.parse(p.expiresAt) - Date.parse(p.preparedAt), 86400000);
  assert.ok(Math.abs(Date.now() - Date.parse(p.preparedAt)) < 30000);
  assert.deepEqual(p.sourceReceipt, bind(await readFile(join(f.output, 'source-import.json'))));
  assert.deepEqual(p.inventory, bind(inventoryBytes(f.verified.inventory)));
  assert.deepEqual(p.tar, bind(await readFile(join(f.output, 'artifact.tar'))));
  assert.deepEqual(p.identity, f.identity);
  assert.deepEqual(JSON.parse(await readFile(join(f.output, 'identity.json'))), f.identity);
  assert.equal(
    JSON.parse(await readFile(join(f.output, 'source-import.json'))).collectedAt,
    f.identity.collectedAt,
  );
  await assert.rejects(access(f.network));
  await assert.rejects(access(workflowOutput));
  assert.deepEqual((await readdir(f.output)).sort(), [
    'artifact.tar',
    'identity.json',
    'inventory.json',
    'preparation.json',
    'source-import.json',
  ]);
  assert.deepEqual(await readFile(configPath), before);
});
test('real two-record GNU tar package matches complete inventory and excludes raw inputs and private receipt', async (t) => {
  const f = await fixture(t),
    result = run(f, await hook(f, { realBuild: true }));
  assert.equal(result.status, 0, result.stderr);
  const inventory = JSON.parse(await readFile(join(f.output, 'inventory.json')));
  const archive = await createRecoveryArchive(
    join(f.output, 'artifact.tar'),
    join(f.root, 'check.gz'),
    inventory,
  );
  assert.deepEqual(archive.tar, bind(await readFile(join(f.output, 'artifact.tar'))));
  const members = spawnSync('tar', ['-tf', join(f.output, 'artifact.tar')], { encoding: 'utf8' });
  assert.equal(members.status, 0, members.stderr);
  assert.doesNotMatch(members.stdout, /source-import|input\.zip|observation|preparation/);
  const files = members.stdout
    .split('\n')
    .filter((n) => n && !n.endsWith('/'))
    .map((n) => n.replace(/^\.\//, ''))
    .sort();
  assert.deepEqual(files, inventory.files.map((e) => e.name).sort());
});
test('synthetic hosted wiring checks direct 404 both before staging and after package verification', async (t) => {
  const f = await fixture(t),
    r = run(f, await hook(f, { mode: 'hosted' }), 'hosted');
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(await readFile(join(f.output, 'preparation.json'))).precondition, {
    status: 404,
    releaseSha256: null,
  });
  assert.equal((await readFile(f.network, 'utf8')).trim().split('\n').length, 2);
});
test('hosted inactive authority refuses before network or input work', async (t) => {
  const f = await fixture(t);
  await rejected(
    f,
    run(f, await hook(f, { mode: 'hosted', active: false }), 'hosted'),
    /active|selected|authority/i,
  );
  await assert.rejects(access(f.network));
  await assert.rejects(access(f.events));
});
for (const [name, options] of [
  ['first 200', { firstStatus: 200 }],
  ['final 200', { finalStatus: 200 }],
  ['first 500', { firstStatus: 500 }],
  ['uncertain transport', { networkFail: true }],
])
  test(`hosted ${name} refuses promotion preserving prior site`, async (t) => {
    const f = await fixture(t),
      before = await readFile(join(f.siteDir, 'release.json'));
    await rejected(
      f,
      run(f, await hook(f, { mode: 'hosted', ...options }), 'hosted'),
      options.networkFail ? /fixture transport failure/ : /HTTP 404/,
    );
    assert.deepEqual(await readFile(join(f.siteDir, 'release.json')), before);
    if (options.firstStatus || options.networkFail) await assert.rejects(access(f.events));
  });
for (const failure of ['source', 'stage', 'build', 'inspection', 'tar', 'archive', 'cleanup'])
  test(`synthetic ${failure} failure cleans owned transaction and preserves input site`, async (t) => {
    const f = await fixture(t),
      before = await readFile(join(f.siteDir, 'release.json'));
    const mode = failure === 'source' ? 'hosted' : 'local-proof';
    await rejected(
      f,
      run(f, await hook(f, { mode, failure }), mode),
      new RegExp(`fixture ${failure} failure`),
    );
    assert.deepEqual(await readFile(join(f.siteDir, 'release.json')), before);
  });
test('output race preserves competing output and cleans only owned scratch', async (t) => {
  const f = await fixture(t),
    r = run(f, await hook(f, { race: true }));
  assert.equal(r.status, 1);
  assert.equal(await readFile(join(f.output, 'sentinel'), 'utf8'), 'competitor');
  assert.equal(
    (await readdir(f.root)).filter((n) => n.startsWith('.prepared.operator-')).length,
    0,
  );
});
test('both CLIs reject malformed argument counts mode flags and non-current configuration paths', async (t) => {
  const f = await fixture(t),
    h = await hook(f);
  for (const mode of ['local-proof', 'hosted'])
    for (const args of [
      [],
      ['--mode', 'local-proof'],
      [configPath, registryPath, 'x', f.output, 'extra'],
      [join(f.root, 'config.json'), registryPath, 'x', f.output],
    ])
      await rejected(f, run(f, h, mode, args));
});
test('current-root loading ignores malicious cwd code and config', async (t) => {
  const f = await fixture(t),
    malicious = join(f.root, 'malicious');
  await mkdir(join(malicious, 'src/pipeline'), { recursive: true });
  await writeFile(join(malicious, 'vite.config.mjs'), 'throw Error("unsafe cwd config")');
  await writeFile(
    join(malicious, 'src/pipeline/stage-initial-source.ts'),
    'throw Error("unsafe cwd code")',
  );
  const result = run(f, await hook(f), 'local-proof', undefined, malicious);
  assert.equal(result.status, 0, result.stderr);
});
test('actual hosted identity rejects local snapshot and missing GitHub run without any network', async (t) => {
  const f = await fixture(t),
    h = await hook(f, { mode: 'hosted', actualIdentity: true });
  const r = run(f, h, 'hosted', undefined, root, { GITHUB_ACTIONS: '', GITHUB_RUN_ID: '' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /requires.*(Git|GitHub)/);
  await assert.rejects(access(f.network));
  await assert.rejects(access(f.events));
  await assert.rejects(access(f.output));
});

test('actual local identity records current executable byte bindings and null run ID', async (t) => {
  const f = await fixture(t),
    r = run(f, await hook(f, { actualIdentity: true }));
  assert.equal(r.status, 0, r.stderr);
  const { operator } = JSON.parse(await readFile(join(f.output, 'preparation.json')));
  assert.match(operator.commit, /^[a-f0-9]{40}$/);
  assert.equal(typeof operator.uncommitted, 'boolean');
  assert.equal(operator.runId, null);
  for (const name of [
    'scripts/initial-import-support.mjs',
    'src/pipeline/stage-initial-source.ts',
    'publication/config.json',
    'reports/source-permission-manifest-2026-08-28.json',
  ])
    assert.deepEqual(operator.codeBindings[name], bind(await readFile(join(root, name))));
  await assert.rejects(access(f.network));
});
for (const mismatch of ['missing', 'additional', 'changed', 'unknown-field', 'symlink'])
  test(`local manifest ${mismatch} refuses before source work`, async (t) => {
    const f = await fixture(t),
      manifest = join(f.root, 'manifest.json');
    const baseline = {
      ...f,
      output: join(f.root, 'identity-baseline'),
      events: join(f.root, 'baseline-events'),
      network: join(f.root, 'baseline-network'),
    };
    const captured = run(baseline, await hook(baseline, { actualIdentity: true }));
    assert.equal(captured.status, 0, captured.stderr);
    const { operator } = JSON.parse(await readFile(join(baseline.output, 'preparation.json')));
    const { runId, ...identity } = operator;
    assert.equal(runId, null);
    const value = { version: 1, kind: 'initial-import-local-code', ...identity };
    if (mismatch === 'missing') delete value.codeBindings['scripts/initial-import-support.mjs'];
    if (mismatch === 'additional') value.codeBindings['unreviewed.mjs'] = bind(Buffer.from('x'));
    if (mismatch === 'changed')
      value.codeBindings['scripts/initial-import-support.mjs'] = bind(Buffer.from('old bytes'));
    if (mismatch === 'unknown-field') value.unreviewed = true;
    await writeFile(manifest, JSON.stringify(value));
    if (mismatch === 'symlink') {
      const { symlink } = await import('node:fs/promises');
      await symlink(manifest, join(f.root, 'linked-manifest'));
    }
    const r = run(
      f,
      await hook(f, {
        actualIdentity: true,
        manifestPath: mismatch === 'symlink' ? join(f.root, 'linked-manifest') : manifest,
      }),
    );
    await rejected(f, r, /manifest|Unsafe.*JSON/);
    await assert.rejects(access(f.events));
    await assert.rejects(access(f.network));
  });
test('existing output is preserved by both operators before source work', async (t) => {
  const f = await fixture(t);
  await mkdir(f.output);
  await writeFile(join(f.output, 'sentinel'), 'preserved');
  for (const mode of ['local-proof', 'hosted']) {
    const r = run(f, await hook(f, { mode }), mode);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /already exists/);
    assert.equal(await readFile(join(f.output, 'sentinel'), 'utf8'), 'preserved');
    await assert.rejects(access(f.network));
    await assert.rejects(access(f.events));
  }
});
for (const [name, receiptPatch] of [
  ['source identity', { sourceId: 'other-source' }],
  ['operator', { operator: { commit: 'wrong' } }],
  ['archive', { archive: { sha256: '0'.repeat(64) } }],
  ['collection', { collectedAt: '2026-01-01T00:00:00.000Z' }],
])
  test(`synthetic receipt ${name} mismatch refuses promotion`, async (t) => {
    const f = await fixture(t);
    await rejected(f, run(f, await hook(f, { receiptPatch })), /receipt.*mismatch/);
  });

async function runFixture(t, patch = {}) {
  const f = await fixture(t);
  await mkdir(f.output);
  const source = { sourceId: 'seoul-2026-10-16-initial', mode: 'hosted', private: true };
  const identity = {
    ...f.identity,
    archiveSha256: 'c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352',
    collectedAt: '2026-10-16T01:52:52.043Z',
    recordCount: 2951024,
    policyRevision: 'task-008-calibration-2026-10-16-v1-proposed',
  };
  const json = (value) => Buffer.from(`${JSON.stringify(value)}\n`);
  const tar = Buffer.from('synthetic already verified raw tar bytes');
  const preparedAt = new Date(Date.now() - 1000).toISOString();
  const preparation = {
    version: 1,
    kind: 'initial-publication-prepared',
    mode: 'hosted',
    sourceId: source.sourceId,
    operator: {
      commit: 'c'.repeat(40),
      uncommitted: false,
      codeBindings: { 'src/.gitkeep': bind(Buffer.alloc(0)) },
      runId: 31,
    },
    sourceReceipt: bind(json(source)),
    identity,
    inventory: bind(inventoryBytes(f.verified.inventory)),
    tar: bind(tar),
    preparedAt,
    expiresAt: new Date(Date.parse(preparedAt) + 86400000).toISOString(),
    precondition: { status: 404, releaseSha256: null },
    ...patch,
  };
  for (const [name, value] of Object.entries({
    'source-import.json': source,
    'identity.json': identity,
    'inventory.json': f.verified.inventory,
    'preparation.json': preparation,
  }))
    await writeFile(join(f.output, name), json(value));
  await writeFile(join(f.output, 'artifact.tar'), tar);
  return { ...f, preparation, metadata: join(f.root, 'metadata') };
}
function bindingCli(script, args, env = {}, cwd = root, preload) {
  return spawnSync(
    process.execPath,
    [...(preload ? ['--import', preload] : []), join(root, `scripts/${script}.mjs`), ...args],
    {
      cwd,
      encoding: 'utf8',
      timeout: 30000,
      env: {
        ...process.env,
        GITHUB_ACTIONS: 'true',
        GITHUB_REPOSITORY: 'internalforces/open-store-searcher',
        GITHUB_REF: 'refs/heads/main',
        GITHUB_SHA: 'c'.repeat(40),
        GITHUB_RUN_ID: '31',
        ...env,
      },
    },
  );
}
test('binder records actual upload ID and post-upload raw tar hash separately from service digest', async (t) => {
  const f = await runFixture(t),
    output = join(f.root, 'github-output');
  const r = bindingCli('bind-initial-import-run', [f.output, '501', f.metadata], {
    GITHUB_OUTPUT: output,
    ARTIFACT_DIGEST: 'f'.repeat(64),
  });
  assert.equal(r.status, 0, r.stderr);
  const bound = JSON.parse(await readFile(join(f.metadata, 'run.json')));
  assert.equal(bound.candidateArtifactId, 501);
  assert.equal(bound.artifactName, 'github-pages');
  assert.equal(bound.tarSha256, bind(await readFile(join(f.output, 'artifact.tar'))).sha256);
  assert.notEqual(bound.tarSha256, 'f'.repeat(64));
  assert.equal(
    bound.preparationSha256,
    bind(await readFile(join(f.metadata, 'preparation.json'))).sha256,
  );
  assert.deepEqual((await readdir(f.metadata)).sort(), [
    'identity.json',
    'inventory.json',
    'preparation.json',
    'run.json',
    'source-import.json',
  ]);
  for (const name of ['identity.json', 'inventory.json', 'preparation.json', 'source-import.json'])
    assert.deepEqual(await readFile(join(f.metadata, name)), await readFile(join(f.output, name)));
  assert.equal(
    await readFile(output, 'utf8'),
    `run_binding=${JSON.stringify(bound)}\ntar_sha256=${bound.tarSha256}\ninventory_sha256=${bound.inventorySha256}\n`,
  );
  const check = bindingCli('check-initial-import-run', [JSON.stringify(bound)]);
  assert.equal(check.status, 0, check.stderr);
});
for (const [name, change, env] of [
  [
    'changed raw tar after upload',
    async (f) =>
      writeFile(join(f.output, 'artifact.tar'), Buffer.alloc(f.preparation.tar.byteLength, 1)),
  ],
  ['changed canonical inventory', async (f) => writeFile(join(f.output, 'inventory.json'), '{}\n')],
  ['changed source receipt', async (f) => writeFile(join(f.output, 'source-import.json'), '{}\n')],
  ['changed identity', async (f) => writeFile(join(f.output, 'identity.json'), '{}\n')],
  ['another SHA', async () => {}, { GITHUB_SHA: 'd'.repeat(40) }],
  ['another run', async () => {}, { GITHUB_RUN_ID: '32' }],
  ['missing actual run', async () => {}, { GITHUB_RUN_ID: '' }],
  ['local environment', async () => {}, { GITHUB_ACTIONS: '' }],
])
  test(`binder refuses ${name} without publishing metadata`, async (t) => {
    const f = await runFixture(t);
    await change(f);
    const r = bindingCli('bind-initial-import-run', [f.output, '501', f.metadata], env);
    assert.equal(r.status, 1, r.stderr);
    await assert.rejects(access(f.metadata));
  });
test('binder rejects local preparation and preserves existing metadata output', async (t) => {
  const f = await runFixture(t, { mode: 'local-proof', precondition: null });
  assert.equal(bindingCli('bind-initial-import-run', [f.output, '501', f.metadata]).status, 1);
  await mkdir(f.metadata);
  await writeFile(join(f.metadata, 'sentinel'), 'preserved');
  assert.equal(bindingCli('bind-initial-import-run', [f.output, '501', f.metadata]).status, 1);
  assert.equal(await readFile(join(f.metadata, 'sentinel'), 'utf8'), 'preserved');
});
test('binding CLIs reject malformed arguments paths and nonpositive upload IDs', async (t) => {
  const f = await runFixture(t);
  for (const args of [
    [],
    [f.output, '0', f.metadata],
    [f.output, '-1', f.metadata],
    [f.output, '1.1', f.metadata],
    [f.output, '001', f.metadata],
    [f.output, '9007199254740992', f.metadata],
    [f.output, '501', f.metadata, 'extra'],
  ])
    assert.equal(bindingCli('bind-initial-import-run', args).status, 1);
  for (const args of [
    [],
    [join(f.output, 'preparation.json')],
    ['https://attacker.example/run.json'],
    ['{}', 'extra'],
    ['x'.repeat(65537)],
  ])
    assert.equal(bindingCli('check-initial-import-run', args).status, 1);
  await assert.rejects(access(f.metadata));
});
test('run guard uses the actual clock before at and after expiry and rejects forged extended expiry', async (t) => {
  const f = await runFixture(t),
    r = bindingCli('bind-initial-import-run', [f.output, '501', f.metadata]);
  assert.equal(r.status, 0, r.stderr);
  const bound = JSON.parse(await readFile(join(f.metadata, 'run.json')));
  for (const [offset, expected] of [
    [-1, 0],
    [0, 1],
    [1, 1],
  ]) {
    const hookPath = join(f.root, `clock-${offset}.mjs`);
    await writeFile(
      hookPath,
      `const RealDate=Date;globalThis.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[${Date.parse(bound.expiresAt) + offset}]));} static now(){return ${Date.parse(bound.expiresAt) + offset};}};`,
    );
    assert.equal(
      bindingCli('check-initial-import-run', [JSON.stringify(bound)], {}, root, hookPath).status,
      expected,
    );
  }
  assert.equal(
    bindingCli('check-initial-import-run', [
      JSON.stringify({
        ...bound,
        expiresAt: new Date(Date.parse(bound.expiresAt) + 86400000).toISOString(),
      }),
    ]).status,
    1,
  );
});
test('postapproval guards reject main advancement and descriptor becoming present during environment wait', async (t) => {
  const f = await runFixture(t);
  assert.equal(bindingCli('bind-initial-import-run', [f.output, '501', f.metadata]).status, 0);
  const bound = await readFile(join(f.metadata, 'run.json'), 'utf8');
  assert.equal(
    bindingCli('check-initial-import-run', [bound], { GITHUB_SHA: 'd'.repeat(40) }).status,
    1,
  );
  const hookPath = join(f.root, 'postapproval-fetch.mjs');
  await writeFile(
    hookPath,
    'globalThis.fetch=async()=>new Response("descriptor appeared during approval");',
  );
  const state = bindingCli(
    'check-publication-state',
    ['https://internalforces.github.io/open-store-searcher/release.json', '404', 'absent'],
    {},
    root,
    hookPath,
  );
  assert.equal(state.status, 1);
});
test('native run guard uses current fixed-root TypeScript without dependencies or malicious cwd imports', async (t) => {
  const f = await runFixture(t);
  assert.equal(bindingCli('bind-initial-import-run', [f.output, '501', f.metadata]).status, 0);
  const bound = await readFile(join(f.metadata, 'run.json'), 'utf8');
  const malicious = join(f.root, 'malicious');
  await mkdir(join(malicious, 'src/pipeline'), { recursive: true });
  await writeFile(
    join(malicious, 'src/pipeline/initial-import-run.ts'),
    'throw Error("malicious cwd validator");',
  );
  const hookPath = join(f.root, 'no-packages.mjs');
  await writeFile(
    hookPath,
    `import {registerHooks} from 'node:module';registerHooks({resolve(specifier,context,next){if(!specifier.startsWith('node:')&&!specifier.startsWith('file:')&&!specifier.startsWith('.')&&!specifier.startsWith('/'))throw Error('Unexpected package import');return next(specifier,context);}});`,
  );
  const r = bindingCli('check-initial-import-run', [bound], {}, malicious, hookPath);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), JSON.parse(bound));
});
