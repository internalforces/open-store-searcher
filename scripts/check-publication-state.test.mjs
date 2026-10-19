import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
const url = 'https://internalforces.github.io/open-store-searcher/release.json';
const hash = (s) => createHash('sha256').update(s).digest('hex');
async function run(t, source, status = '200', sha = hash('descriptor'), target = url, setup = '') {
  const root = await mkdtemp(join(tmpdir(), 'descriptor-guard-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const hook = join(root, 'fetch.mjs');
  await writeFile(
    hook,
    `${setup}
globalThis.fetch = async (url, options) => {
    if (String(url) !== ${JSON.stringify(url)} || options.redirect !== 'error' || options.credentials !== 'omit' || options.cache !== 'no-store') throw Error('Unsafe request');
    ${source}
  };`,
  );
  return spawnSync(
    process.execPath,
    ['--import', hook, 'scripts/check-publication-state.mjs', target, status, sha],
    { encoding: 'utf8', timeout: 10_000 },
  );
}
test('descriptor guard confirms only the exact recorded 200 bytes without claiming deployment', async (t) => {
  const r = await run(t, "return new Response('descriptor');");
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), {
    version: 1,
    kind: 'publication-state-unchanged',
    status: 200,
    releaseSha256: hash('descriptor'),
  });
});
test('descriptor guard confirms recorded absence and rejects unexpected absence or newly present state', async (t) => {
  assert.equal(
    (await run(t, 'return new Response(null,{status:404});', '404', 'absent')).status,
    0,
  );
  assert.notEqual((await run(t, 'return new Response(null,{status:404});')).status, 0);
  assert.notEqual((await run(t, "return new Response('descriptor');", '404', 'absent')).status, 0);
});
test('descriptor guard rejects descriptor changed after environment approval', async (t) => {
  assert.notEqual((await run(t, "return new Response('new coherent descriptor');")).status, 0);
});
for (const [label, source] of [
  [
    'redirect',
    "return new Response(null,{status:302,headers:{location:'https://attacker.example/'}});",
  ],
  [
    'followed redirect',
    "const r = new Response('descriptor'); Object.defineProperty(r,'redirected',{value:true}); return r;",
  ],
  ['unexpected HTTP', 'return new Response(null,{status:500});'],
  ['oversized stream', 'return new Response(new Uint8Array(8*1024*1024+1));'],
  [
    'timeout',
    'const original = globalThis.setTimeout; globalThis.setTimeout = (fn,_ms) => original(fn,5); return new Response(new ReadableStream({pull(){return new Promise(()=>{});}}));',
  ],
])
  test(`descriptor guard rejects ${label}`, async (t) => {
    assert.notEqual((await run(t, source)).status, 0);
  });
for (const [status, sha, target] of [
  ['200', 'absent', url],
  ['404', hash('descriptor'), url],
  ['201', hash('descriptor'), url],
  ['200', 'A'.repeat(64), url],
  ['200', hash('descriptor'), 'https://attacker.example/release.json'],
])
  test(`descriptor guard rejects malformed contract ${status} ${sha.slice(0, 6)} ${target}`, async (t) => {
    assert.notEqual(
      (await run(t, "throw Error('must not fetch');", status, sha, target)).status,
      0,
    );
  });

test('descriptor guard hashes decoded bytes independently of compressed HTTP wire length', async (t) => {
  const r = await run(
    t,
    "return new Response('descriptor',{headers:{'Content-Encoding':'gzip','Content-Length':'2'}});",
  );
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).releaseSha256, hash('descriptor'));
});
test('descriptor guard rejects a continuously active body past the overall deadline', async (t) => {
  const r = await run(
    t,
    'const start=Date.now();let count=0; Date.now=()=>start+(count++)*900001; return new Response(new ReadableStream({pull(c){c.enqueue(new Uint8Array([1]));}}));',
  );
  assert.notEqual(r.status, 0);
  assert.equal(r.error, undefined, 'must fail within the CLI timeout');
});

test('descriptor guard times out a stalled response before headers', async (t) => {
  const r = await run(
    t,
    'return new Promise(()=>{});',
    '200',
    hash('descriptor'),
    url,
    'const original=setTimeout;globalThis.setTimeout=(fn,_ms)=>original(fn,5);',
  );
  assert.notEqual(r.status, 0);
  assert.equal(r.error, undefined);
  assert.equal(r.stdout, '');
});
