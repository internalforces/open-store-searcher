import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { link, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

// Exercise the actual workflow shell on the approved Ubuntu runner, without an upload or token.
const workflow = await readFile(
  new URL('../.github/workflows/refresh.yml', import.meta.url),
  'utf8',
);
const blocks = [
  ...workflow.matchAll(/ {6}- name: Package accepted Pages artifact\n([\s\S]*?)(?= {6}- |$)/g),
];
assert.equal(blocks.length, 1, 'Expected exactly one Pages packaging step');
assert.match(blocks[0][1], /^ {8}shell: bash$/m);
const body = blocks[0][1].split('        run: |\n');
assert.equal(body.length, 2, 'Expected a literal packaging script');
assert.ok(body[1].trim());
assert.ok(
  body[1]
    .trimEnd()
    .split('\n')
    .every((line) => line.startsWith('          ')),
);
const script = body[1]
  .trimEnd()
  .split('\n')
  .map((line) => line.slice(10))
  .join('\n');
assert.ok(!script.includes('${{'), 'Workflow expressions must not enter the shell');
assert.ok(!blocks[0][1].includes('continue-on-error'));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 10_000, ...options });
  if (result.error) throw result.error;
  return result;
}
assert.match(
  run('tar', ['--version']).stdout,
  /GNU tar/,
  'Run on the approved Ubuntu GNU tar host',
);

async function fixture(context, withSite = true) {
  const root = await mkdtemp(join(tmpdir(), 'pages-artifact-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const temporary = join(root, 'runner space; $(not-a-command)');
  const site = join(temporary, 'site');
  await mkdir(withSite ? site : temporary, { recursive: true });
  const pack = () =>
    run('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', script], {
      env: { ...process.env, RUNNER_TEMP: temporary },
    });
  return { site, pack, archive: join(temporary, 'artifact.tar') };
}

function contents(archive, name) {
  const result = run('tar', ['-xOf', archive, name]);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test('Pages package preserves root, nested and hidden bytes while excluding repository metadata', async (t) => {
  const { site, pack, archive } = await fixture(t);
  await mkdir(join(site, 'assets'));
  await mkdir(join(site, '.git'));
  await mkdir(join(site, '.github'));
  await writeFile(join(site, 'index.html'), '<main>fixture</main>');
  await writeFile(join(site, '.nojekyll'), 'hidden fixture');
  await writeFile(join(site, 'assets', 'data.json'), '{"fixture":true}');
  await writeFile(join(site, '.git', 'excluded.txt'), 'excluded');
  await writeFile(join(site, '.github', 'excluded.txt'), 'excluded');
  const result = pack();
  assert.equal(result.status, 0, result.stderr);
  const listing = run('tar', ['-tf', archive]);
  assert.equal(listing.status, 0, listing.stderr);
  assert.deepEqual(
    listing.stdout.trim().split('\n').sort(),
    ['./', './.nojekyll', './assets/', './assets/data.json', './index.html'].sort(),
  );
  assert.equal(contents(archive, './index.html'), '<main>fixture</main>');
  assert.equal(contents(archive, './.nojekyll'), 'hidden fixture');
  assert.equal(contents(archive, './assets/data.json'), '{"fixture":true}');
});

test('Pages package materializes symlinks and hard links as ordinary files', async (t) => {
  const { site, pack, archive } = await fixture(t);
  await writeFile(join(site, 'original.txt'), 'same bytes');
  await symlink('original.txt', join(site, 'symbolic.txt'));
  await link(join(site, 'original.txt'), join(site, 'hard.txt'));
  const result = pack();
  assert.equal(result.status, 0, result.stderr);
  const listing = run('tar', ['-tvf', archive]);
  assert.equal(listing.status, 0, listing.stderr);
  assert.ok(
    listing.stdout
      .trim()
      .split('\n')
      .every((line) => /^[d-]/.test(line)),
    listing.stdout,
  );
  for (const name of ['original.txt', 'symbolic.txt', 'hard.txt']) {
    assert.equal(contents(archive, `./${name}`), 'same bytes');
  }
});

test('Pages package fails when the accepted site directory is missing', async (t) => {
  const { pack } = await fixture(t, false);
  const result = pack();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Cannot open|No such file/);
});

test('Pages package fails on a dangling link rather than silently omitting it', async (t) => {
  const { site, pack } = await fixture(t);
  await symlink('missing.txt', join(site, 'dangling.txt'));
  const result = pack();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Cannot stat|No such file/);
});
