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
function runStep(yaml, jobName, stepName) {
  const block = job(yaml, jobName);
  const start = block.indexOf(`- name: ${stepName}`);
  assert.notEqual(start, -1, `missing ${jobName} step: ${stepName}`);
  const tail = block.slice(start);
  const end = tail.search(/^ {6}- /m);
  const step = end < 0 ? tail : tail.slice(0, end);
  const inline = step.match(/^ {8}run: (?!\|$)(.+)$/m)?.[1];
  const multiline = step.match(/^ {8}run: \|\n((?: {10}[^\n]*\n?)+)/m)?.[1];
  const script = inline ?? multiline?.replace(/^ {10}/gm, '');
  assert.ok(script, `${jobName}/${stepName} must be an executable run step`);
  return script;
}
function runShell(script, env = {}, cwd = process.cwd()) {
  return spawnSync('bash', ['-e', '-c', script], {
    cwd,
    encoding: 'utf8',
    timeout: 15000,
    env: { ...process.env, ...env },
  });
}
const initialSha = 'c'.repeat(40);
function initialRunBinding(expiresAt) {
  const preparedAt = new Date(Date.parse(expiresAt) - 86400000).toISOString();
  return JSON.stringify({
    version: 1,
    kind: 'initial-import-run-bound',
    workflowPath: '.github/workflows/initial-import.yml',
    sourceId: 'seoul-2026-10-16-initial',
    operatorSha: initialSha,
    runId: 31,
    candidateArtifactId: 501,
    artifactName: 'github-pages',
    preparationSha256: 'a'.repeat(64),
    tarSha256: 'b'.repeat(64),
    inventorySha256: 'd'.repeat(64),
    preparedAt,
    expiresAt,
  });
}
async function finalGuardFixture(
  t,
  script,
  { now, currentSha = initialSha, fetchFails = false, apiFails = false },
) {
  const directory = await mkdtemp(join(tmpdir(), 'initial-final-guard-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const events = join(directory, 'events');
  const clock = join(directory, 'clock');
  const binding = initialRunBinding(new Date(now + 60000).toISOString());
  await writeFile(clock, String(now));
  await writeFile(
    join(directory, 'gh'),
    `#!/bin/sh\nprintf 'main\\n' >> "$EVENTS"\nif [ -n "\${ADVANCE_AFTER_MAIN:-}" ]; then printf '%s' "$ADVANCE_AFTER_MAIN" > "$TEST_CLOCK"; fi\n${apiFails ? "echo 'simulated gh api transport failure' >&2; exit 1;" : `printf '%s\\n' '${currentSha}'`}\n`,
    { mode: 0o700 },
  );
  const preload = join(directory, 'preload.mjs');
  await writeFile(
    preload,
    `import { readFileSync, appendFileSync, writeFileSync } from 'node:fs';\nconst RealDate = Date;\nconst clock = () => Number(readFileSync(process.env.TEST_CLOCK, 'utf8'));\nglobalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [clock()])); } static now() { return clock(); } };\nglobalThis.fetch = async (...args) => { appendFileSync(process.env.EVENTS, 'probe\\n'); ${fetchFails ? "throw new Error('transport failed');" : 'if (process.env.ADVANCE_AFTER_PROBE) writeFileSync(process.env.TEST_CLOCK, process.env.ADVANCE_AFTER_PROBE); return new Response(null, { status: 404 });'} };\n`,
  );
  const node = join(directory, 'node');
  await writeFile(node, `#!/bin/sh\nexec '${process.execPath}' --import "$TEST_PRELOAD" "$@"\n`, {
    mode: 0o700,
  });
  const result = runShell(
    script,
    {
      PATH: `${directory}:${process.env.PATH}`,
      TEST_PRELOAD: preload,
      TEST_CLOCK: clock,
      EVENTS: events,
      GH_REPO: 'internalforces/open-store-searcher',
      EXPECTED_SHA: initialSha,
      RUN_BINDING: binding,
      GITHUB_ACTIONS: 'true',
      GITHUB_REPOSITORY: 'internalforces/open-store-searcher',
      GITHUB_REF: 'refs/heads/main',
      GITHUB_SHA: initialSha,
      GITHUB_RUN_ID: '31',
    },
    process.cwd(),
  );
  return { result, events: await readFile(events, 'utf8').catch(() => ''), directory };
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

test('initial import keeps the early trusted-run expiry fast-fail before public probing', () => {
  const early = runStep(
    initial,
    'deploy',
    'Recheck the trusted same-run preparation after environment approval',
  );
  const expired = initialRunBinding(new Date(Date.now() - 1).toISOString());
  const result = runShell(early, {
    RUN_BINDING: expired,
    GITHUB_ACTIONS: 'true',
    GITHUB_REPOSITORY: 'internalforces/open-store-searcher',
    GITHUB_REF: 'refs/heads/main',
    GITHUB_SHA: initialSha,
    GITHUB_RUN_ID: '31',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid, mismatched or expired/i);
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
test('actual initial early postapproval current-main command rejects main advancement', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'initial-main-guard-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const guard = runStep(initial, 'deploy', 'Reject obsolete code after environment approval');
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

test('initial import rejects rerun attempts as the first executable step in both jobs', () => {
  const names = ['prepare', 'deploy'];
  for (const name of names) {
    const block = job(initial, name);
    const steps = block.match(/^ {4}steps:\n([\s\S]*)/m)?.[1] ?? '';
    const firstEntry = steps.match(/^ {6}- [^\n]+/m)?.[0];
    assert.equal(firstEntry, '      - name: Reject workflow reruns');
    const guard = runStep(initial, name, 'Reject workflow reruns');
    for (const attempt of ['1', '2', '7']) {
      const result = runShell(guard, { GITHUB_RUN_ATTEMPT: attempt });
      assert.equal(result.status, attempt === '1' ? 0 : 1, `${name} attempt=${attempt}`);
      if (attempt !== '1') assert.match(result.stderr, /new workflow_dispatch/i);
    }
    for (const attempt of [undefined, '', '0', '01', '1x', 'malformed']) {
      const result = runShell(guard, { GITHUB_RUN_ATTEMPT: attempt });
      assert.equal(result.status, 1, `${name} malformed attempt=${attempt}`);
      assert.match(result.stderr, /new workflow_dispatch/i);
    }
    assert.ok(block.indexOf('Reject workflow reruns') < block.indexOf('uses: actions/checkout'));
  }
});

test('initial final guard probes public 404, rechecks main, then validates the same-run binding immediately before deploy', async (t) => {
  const deploy = job(initial, 'deploy');
  const finalStep = runStep(
    initial,
    'deploy',
    'Final current-main and trusted-run check after public 404 probe',
  );
  const deployIndex = deploy.indexOf('uses: actions/deploy-pages');
  const stepIndex = deploy.indexOf(
    'Final current-main and trusted-run check after public 404 probe',
  );
  assert.ok(stepIndex >= 0 && stepIndex < deployIndex);
  assert.equal(deploy.slice(stepIndex, deployIndex).match(/^ {6}- /gm)?.length, 1);
  assert.ok(finalStep.indexOf('check-publication-state.mjs') < finalStep.indexOf('gh api'));
  assert.ok(finalStep.indexOf('gh api') < finalStep.indexOf('check-initial-import-run.mjs'));
  assert.match(finalStep, /check-initial-import-run\.mjs "\$RUN_BINDING"/);
  const now = Date.now();
  const success = await finalGuardFixture(t, finalStep, { now });
  assert.equal(success.result.status, 0, success.result.stderr);
  assert.deepEqual(success.events.trim().split('\n'), ['probe', 'main']);
  const obsolete = await finalGuardFixture(t, finalStep, { now, currentSha: 'd'.repeat(40) });
  assert.equal(obsolete.result.status, 1);
  assert.deepEqual(obsolete.events.trim().split('\n'), ['probe', 'main']);
  const transport = await finalGuardFixture(t, finalStep, { now, fetchFails: true });
  assert.equal(transport.result.status, 1);
  assert.deepEqual(transport.events.trim().split('\n'), ['probe']);
  const apiFailure = await finalGuardFixture(t, finalStep, { now, apiFails: true });
  assert.equal(apiFailure.result.status, 1);
  assert.match(apiFailure.result.stderr, /simulated gh api transport failure/);
  assert.deepEqual(apiFailure.events.trim().split('\n'), ['probe', 'main']);
});

test('initial final guard accepts a binding before expiry and rejects it at or after expiry after both network probes', async (t) => {
  const finalStep = runStep(
    initial,
    'deploy',
    'Final current-main and trusted-run check after public 404 probe',
  );
  const now = Date.now();
  for (const [offset, expected] of [
    [-1, 0],
    [0, 1],
    [1, 1],
  ]) {
    const fixture = await finalGuardFixture(t, finalStep, {
      now: now - 60000,
    });
    await writeFile(join(fixture.directory, 'events'), '');
    await writeFile(join(fixture.directory, 'clock'), String(now + offset));
    const checked = runShell(
      finalStep,
      {
        PATH: `${fixture.directory}:${process.env.PATH}`,
        TEST_PRELOAD: join(fixture.directory, 'preload.mjs'),
        TEST_CLOCK: join(fixture.directory, 'clock'),
        EVENTS: join(fixture.directory, 'events'),
        GH_REPO: 'internalforces/open-store-searcher',
        EXPECTED_SHA: initialSha,
        RUN_BINDING: initialRunBinding(new Date(now).toISOString()),
        GITHUB_ACTIONS: 'true',
        GITHUB_REPOSITORY: 'internalforces/open-store-searcher',
        GITHUB_REF: 'refs/heads/main',
        GITHUB_SHA: initialSha,
        GITHUB_RUN_ID: '31',
      },
      process.cwd(),
    );
    assert.equal(checked.status, expected, `expiry offset ${offset}`);
    assert.deepEqual(
      (await readFile(join(fixture.directory, 'events'), 'utf8')).trim().split('\n'),
      ['probe', 'main'],
    );
  }
});

test('initial final guard rejects expiry reached during either network probe before publishing', async (t) => {
  const finalStep = runStep(
    initial,
    'deploy',
    'Final current-main and trusted-run check after public 404 probe',
  );
  const now = Date.now();
  for (const advance of ['probe', 'main']) {
    const fixture = await finalGuardFixture(t, finalStep, { now: now - 60000 });
    await writeFile(join(fixture.directory, 'events'), '');
    await writeFile(join(fixture.directory, 'clock'), String(now - 60000));
    const checked = runShell(finalStep, {
      PATH: `${fixture.directory}:${process.env.PATH}`,
      TEST_PRELOAD: join(fixture.directory, 'preload.mjs'),
      TEST_CLOCK: join(fixture.directory, 'clock'),
      EVENTS: join(fixture.directory, 'events'),
      GH_REPO: 'internalforces/open-store-searcher',
      EXPECTED_SHA: initialSha,
      RUN_BINDING: initialRunBinding(new Date(now).toISOString()),
      GITHUB_ACTIONS: 'true',
      GITHUB_REPOSITORY: 'internalforces/open-store-searcher',
      GITHUB_REF: 'refs/heads/main',
      GITHUB_SHA: initialSha,
      GITHUB_RUN_ID: '31',
      ...(advance === 'probe'
        ? { ADVANCE_AFTER_PROBE: String(now) }
        : { ADVANCE_AFTER_MAIN: String(now) }),
    });
    assert.equal(checked.status, 1, `expiry advanced during ${advance}`);
    assert.deepEqual(
      (await readFile(join(fixture.directory, 'events'), 'utf8')).trim().split('\n'),
      ['probe', 'main'],
    );
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
