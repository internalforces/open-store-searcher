import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const read = (p) => readFile(new URL(`../${p}`, import.meta.url), 'utf8');
const refresh = await read('.github/workflows/refresh.yml');
const verify = await read('.github/workflows/verify.yml');
const restore = await read('.github/workflows/restore.yml').catch(() => '');
const initial = await read('.github/workflows/initial-import.yml').catch(() => '');
function job(yaml, name) {
  return (
    yaml.match(
      new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  [a-z][a-z-]*:|$(?![\\s\\S]))`, 'm'),
    )?.[1] ?? ''
  );
}
const nodes = [
  'scripts/check-pages-artifact.test.mjs',
  'scripts/check-publication-state.test.mjs',
  'scripts/check-publication-workflows.test.mjs',
  'scripts/publication-operators.test.mjs',
];
test('refresh evaluates its actual default-off schedule and current-main predicate truth table', () => {
  const expression = job(refresh, 'prepare').match(/^ {4}if: (.+)$/m)?.[1];
  assert.ok(expression);
  // Trusted checked-in expression only; evaluate it, rather than compare its spelling.
  const evaluate = new Function(
    'github',
    'vars',
    'format',
    `return (${expression.replace(/^\$\{\{\s*|\s*\}\}$/g, '')});`,
  );
  for (const event of ['schedule', 'workflow_dispatch', 'push', 'pull_request'])
    for (const main of [true, false])
      for (const enabled of [undefined, 'false', 'true']) {
        const github = {
          ref: main ? 'refs/heads/main' : 'refs/heads/other',
          event_name: event,
          event: { repository: { default_branch: 'main' } },
        };
        assert.equal(
          Boolean(
            evaluate(github, { PAGES_SCHEDULE_ENABLED: enabled }, (_s, v) => `refs/heads/${v}`),
          ),
          main && (event === 'workflow_dispatch' || (event === 'schedule' && enabled === 'true')),
          JSON.stringify({ event, main, enabled }),
        );
      }
});
test('restore is manual-only default-branch and deny-all with shared protected same-run promotion', () => {
  assert.match(restore, /^ {2}workflow_dispatch:/m);
  assert.doesNotMatch(restore, /^ {2}(schedule|push|pull_request|workflow_run):/m);
  assert.match(restore, /^ {6}backup_id:/m);
  assert.equal(
    (restore.split('permissions: {}')[0].match(/^ {6}[a-z_]+:/gm) ?? []).filter(
      (x) => !x.includes('backup_id'),
    ).length,
    0,
  );
  assert.match(restore, /^permissions: \{\}/m);
  assert.match(restore, /group: pages-publication/);
  assert.match(restore, /cancel-in-progress: false/);
  const prepare = job(restore, 'prepare'),
    deploy = job(restore, 'deploy');
  assert.match(prepare, /github.event_name == 'workflow_dispatch'/);
  assert.match(
    prepare,
    /github.ref == format\('refs\/heads\/\{0\}', github.event.repository.default_branch\)/,
  );
  assert.match(prepare, /permissions:\n {6}contents: read/);
  assert.doesNotMatch(prepare, /pages: write|id-token: write|actions: read|contents: write/);
  assert.match(deploy, /needs: prepare/);
  assert.match(deploy, /PAGES_PUBLICATION_ENABLED == 'true'/);
  assert.match(deploy, /name: github-pages/);
  assert.match(deploy, /pages: write/);
  assert.match(deploy, /id-token: write/);
  assert.match(prepare, /git ls-remote/);
  assert.match(deploy, /gh api/);
  assert.match(deploy, /test "\$current_sha" = "\$EXPECTED_SHA"/);
  assert.match(prepare, /restore-publication.mjs/);
  assert.match(prepare, /name: github-pages/);
  assert.match(prepare, /retention-days: 1/);
  assert.equal((prepare.match(/name: github-pages/g) ?? []).length, 1);
  assert.match(deploy, /check-publication-state.mjs/);
  assert.match(deploy, /persist-credentials: false/);
  assert.doesNotMatch(deploy, /run:.*(?:npm |restore-publication|tar |build-publication)/);
  for (const block of restore.split(/\n {6}- /))
    if (block.includes('run:')) assert.doesNotMatch(block.split('run:')[1], /\$\{\{/);
  assert.match(prepare, /BACKUP_ID: \$\{\{ inputs.backup_id \}\}/);
});
test('workflows retain exact action pins runtimes and extend initial refresh verify to five Node suites', () => {
  const pins = {
    checkout: '08c6903cd8c0fde910a37f88322edcfb5dd907a8',
    'setup-node': 'a0853c24544627f65ddf259abe73b1d18a591444',
    'upload-artifact': 'ea165f8d65b6e75b540449e92b4886f43607fa02',
    'deploy-pages': 'd6db90164ac5ed86f2b6aed7e0febac5b3c0c03e',
  };
  for (const yaml of [refresh, restore, verify, initial]) {
    assert.match(yaml, /ubuntu-24.04/);
    assert.match(yaml, /node-version: 24.19.0/);
    for (const m of yaml.matchAll(/uses: actions\/([\w-]+)@([^\s]+)/g))
      assert.equal(m[2], pins[m[1]]);
  }
  for (const block of [job(refresh, 'prepare'), job(restore, 'prepare'), job(verify, 'verify')])
    for (const file of nodes) assert.ok(block.includes(file), file);
  for (const block of [job(refresh, 'prepare'), job(verify, 'verify'), job(initial, 'prepare')]) {
    for (const file of [...nodes, 'scripts/initial-import-operators.test.mjs'])
      assert.ok(block.includes(file), file);
    const command = block.match(/run: node --test (.+)/)?.[1];
    assert.deepEqual(command?.split(' '), [...nodes, 'scripts/initial-import-operators.test.mjs']);
  }
  assert.match(refresh, /name: publication-metadata/);
  assert.match(refresh, /inspect-publication.mjs/);
  assert.match(refresh, /retention-days: 1/);
});

test('initial import evaluates actual manual main and default-off publication predicates for every event', () => {
  const evaluate = (block) => {
    const expression = block.match(/^ {4}if: (.+)$/m)?.[1];
    assert.ok(expression);
    return new Function('github', 'vars', `return (${expression});`);
  };
  const prepare = evaluate(job(initial, 'prepare')),
    deploy = evaluate(job(initial, 'deploy'));
  for (const event of [
    'workflow_dispatch',
    'schedule',
    'push',
    'pull_request',
    'pull_request_target',
    'workflow_run',
    'repository_dispatch',
    'issue_comment',
    'issues',
    'release',
    'create',
    'delete',
    'fork',
    'page_build',
    'status',
    'check_run',
    'check_suite',
    'deployment',
    'deployment_status',
    'workflow_call',
    'workflow_job',
    'workflow_run',
    'unknown',
  ])
    for (const branch of ['main', 'other'])
      for (const enabled of [undefined, 'false', 'true']) {
        const github = { event_name: event, ref: `refs/heads/${branch}` };
        assert.equal(
          Boolean(prepare(github, { PAGES_PUBLICATION_ENABLED: enabled })),
          event === 'workflow_dispatch' && branch === 'main',
        );
        assert.equal(
          Boolean(deploy(github, { PAGES_PUBLICATION_ENABLED: enabled })),
          event === 'workflow_dispatch' && branch === 'main' && enabled === 'true',
        );
      }
});
test('initial import shares noncancelling publication lock and only a manual source ID under existing permissions', () => {
  assert.match(initial, /^ {2}workflow_dispatch:/m);
  assert.doesNotMatch(
    initial,
    /^ {2}(schedule|push|pull_request|workflow_run|repository_dispatch):/m,
  );
  assert.deepEqual(initial.split('permissions: {}')[0].match(/^ {6}[a-z_]+:/gm), [
    '      source_id:',
  ]);
  for (const yaml of [initial, refresh, restore]) {
    assert.match(yaml, /group: pages-publication/);
    assert.match(yaml, /cancel-in-progress: false/);
  }
  assert.match(initial, /^permissions: \{\}/m);
  const prepare = job(initial, 'prepare'),
    deploy = job(initial, 'deploy');
  assert.match(prepare, /timeout-minutes: 60/);
  assert.match(deploy, /timeout-minutes: 10/);
  assert.match(prepare, /permissions:\n {6}contents: read/);
  assert.doesNotMatch(prepare, /pages: write|id-token: write|actions: read|contents: write/);
  assert.match(deploy, /permissions:\n {6}contents: read\n {6}pages: write\n {6}id-token: write/);
  assert.match(deploy, /environment:\n {6}name: github-pages/);
  assert.doesNotMatch(
    initial,
    /actions: read|contents: write|auto.?approv|pending_deployments|deployment_protection_rule|download-artifact|overwrite:|artifact_ids:|run_id:/i,
  );
  assert.match(prepare, /npm run verify:full/);
  for (const jobBlock of [prepare, deploy])
    for (const block of jobBlock.split(/\n {6}- /))
      if (block.includes('run:')) assert.doesNotMatch(block.split('run:')[1], /\$\{\{/);
});
test('initial import binds only real upload outputs and deploys the one fixed same-run Pages artifact', () => {
  const prepare = job(initial, 'prepare'),
    deploy = job(initial, 'deploy');
  assert.match(prepare, /SOURCE_ID: \$\{\{ inputs.source_id \}\}/);
  assert.match(
    prepare,
    /stage-initial-import.mjs publication\/config.json publication\/initial-import-approvals.json "\$SOURCE_ID" "\$RUNNER_TEMP\/initial-prepared"/,
  );
  assert.match(prepare, /CANDIDATE_ARTIFACT_ID: \$\{\{ steps.candidate.outputs.artifact-id \}\}/);
  assert.match(
    prepare,
    /bind-initial-import-run.mjs "\$RUNNER_TEMP\/initial-prepared" "\$CANDIDATE_ARTIFACT_ID" "\$RUNNER_TEMP\/initial-metadata"/,
  );
  assert.match(prepare, /run_binding: \$\{\{ steps.binding.outputs.run_binding \}\}/);
  assert.match(prepare, /candidate_artifact_id: \$\{\{ steps.candidate.outputs.artifact-id \}\}/);
  assert.match(
    prepare,
    /candidate_service_digest: \$\{\{ steps.candidate.outputs.artifact-digest \}\}/,
  );
  assert.match(prepare, /metadata_artifact_id: \$\{\{ steps.metadata.outputs.artifact-id \}\}/);
  assert.equal((prepare.match(/name: github-pages/g) ?? []).length, 1);
  assert.equal((prepare.match(/name: initial-import-metadata/g) ?? []).length, 1);
  assert.equal((prepare.match(/retention-days: 1/g) ?? []).length, 2);
  assert.match(prepare, /path: \$\{\{ runner.temp \}\}\/initial-prepared\/artifact.tar/);
  assert.ok(prepare.indexOf('stage-initial-import.mjs') < prepare.indexOf('git ls-remote'));
  assert.ok(prepare.indexOf('git ls-remote') < prepare.indexOf('id: candidate'));
  assert.ok(prepare.indexOf('id: candidate') < prepare.indexOf('bind-initial-import-run.mjs'));
  assert.ok(prepare.indexOf('bind-initial-import-run.mjs') < prepare.indexOf('id: metadata'));
  assert.match(deploy, /RUN_BINDING: \$\{\{ needs.prepare.outputs.run_binding \}\}/);
  assert.match(deploy, /check-initial-import-run.mjs "\$RUN_BINDING"/);
  assert.match(
    deploy,
    /check-publication-state.mjs https:\/\/internalforces.github.io\/open-store-searcher\/release.json 404 absent/,
  );
  assert.ok(deploy.indexOf('gh api') < deploy.indexOf('uses: actions/checkout'));
  assert.match(deploy, /ref: \$\{\{ github.sha \}\}/);
  assert.ok(
    deploy.indexOf('uses: actions/checkout') < deploy.indexOf('check-initial-import-run.mjs'),
  );
  assert.ok(
    deploy.indexOf('check-initial-import-run.mjs') < deploy.indexOf('check-publication-state.mjs'),
  );
  assert.ok(
    deploy.indexOf('check-publication-state.mjs') < deploy.indexOf('uses: actions/deploy-pages'),
  );
  assert.match(deploy, /artifact_name: github-pages/);
  assert.doesNotMatch(
    deploy,
    /npm |stage-initial|build-publication|collect|restore-publication|tar --/,
  );
});
test('actual initial source command treats malicious source_id as one inert argument', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'initial-workflow-input-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const sentinel = join(directory, 'executed');
  const command = job(initial, 'prepare').match(
    /run: (node scripts\/stage-initial-import\.mjs .+)/,
  )?.[1];
  assert.ok(command);
  const result = spawnSync('bash', ['-c', command], {
    encoding: 'utf8',
    timeout: 30000,
    env: {
      ...process.env,
      RUNNER_TEMP: directory,
      SOURCE_ID: `"; touch '${sentinel}'; # $(touch '${sentinel}')`,
    },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /authority/);
  await assert.rejects(access(sentinel));
  await assert.rejects(access(join(directory, 'initial-prepared')));
});
test('actual initial postapproval current-main command rejects main advancement', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'initial-main-guard-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const guard = job(initial, 'deploy').match(/run: \|\n((?: {10}[^\n]*\n)+)/)?.[1];
  assert.ok(guard);
  const expected = 'c'.repeat(40);
  for (const current of [expected, 'd'.repeat(40)]) {
    await writeFile(join(directory, 'gh'), `#!/bin/sh\nprintf '%s\\n' '${current}'\n`, {
      mode: 0o700,
    });
    const r = spawnSync('bash', ['-c', guard], {
      encoding: 'utf8',
      timeout: 10000,
      env: {
        ...process.env,
        PATH: `${directory}:${process.env.PATH}`,
        GH_REPO: 'internalforces/open-store-searcher',
        EXPECTED_SHA: expected,
      },
    });
    assert.equal(r.status, current === expected ? 0 : 1, r.stderr);
  }
});
test('production configuration equals exactly the approved configuration with unchanged quality objects', async () => {
  const config = JSON.parse(await read('publication/config.json'));
  const proposal = JSON.parse(
    await read('reports/proposed-2026-10-19-task-009-operational-config.json'),
  );
  const validation = JSON.parse(await read('publication/validation-config.json'));
  assert.deepEqual(config, proposal.configuration);
  for (const k of ['policy', 'baseline', 'reviewedUnverifiedPairs'])
    assert.deepEqual(config[k], validation[k]);
  assert.equal(
    config.previousReleaseUrl,
    'https://internalforces.github.io/open-store-searcher/release.json',
  );
  assert.deepEqual(
    [config.maxEntryBytes, config.maxTotalRows, config.entryTimeoutMs],
    [536870912, 3000000, 120000],
  );
});
test('promotion chain checks current main before unchanged tar upload and guards again before deploy', () => {
  const prepare = job(restore, 'prepare');
  const deploy = job(restore, 'deploy');
  assert.match(prepare, /test "\$current_sha" = "\$EXPECTED_SHA"/);
  assert.ok(prepare.indexOf('restore-publication.mjs') < prepare.indexOf('git ls-remote'));
  assert.ok(prepare.indexOf('git ls-remote') < prepare.indexOf('uses: actions/upload-artifact'));
  assert.ok(deploy.indexOf('gh api') < deploy.indexOf('uses: actions/checkout'));
  assert.ok(
    deploy.indexOf('uses: actions/checkout') < deploy.indexOf('check-publication-state.mjs'),
  );
  assert.ok(
    deploy.indexOf('check-publication-state.mjs') < deploy.indexOf('uses: actions/deploy-pages'),
  );
  assert.doesNotMatch(restore, /download-artifact|artifact_ids|run_id:/);
  for (const yaml of [refresh, restore, verify]) assert.match(yaml, /^permissions: \{\}/m);
  for (const block of [job(refresh, 'prepare'), prepare, job(verify, 'verify')])
    assert.match(block, /npm install --global npm@11.17.0/);
  const refreshPrepare = job(refresh, 'prepare');
  assert.ok(
    refreshPrepare.indexOf('inspect-publication.mjs') < refreshPrepare.indexOf('git ls-remote'),
  );
  assert.ok(refreshPrepare.indexOf('git ls-remote') < refreshPrepare.indexOf('tar --dereference'));
  assert.equal((refresh.match(/name: publication-metadata/g) ?? []).length, 1);
});
