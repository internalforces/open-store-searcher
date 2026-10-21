// Current-checkout code only. Native Node 24 TypeScript loading needs no package lifecycle code.
import { registerHooks } from 'node:module';

const pipeline = new URL('../src/pipeline/', import.meta.url);
try {
  const [json] = process.argv.slice(2);
  if (process.argv.length !== 3 || typeof json !== 'string' || Buffer.byteLength(json) > 64 * 1024)
    throw new Error('Bound initial run scalar JSON required');
  const runId = Number(process.env.GITHUB_RUN_ID);
  if (
    process.env.GITHUB_ACTIONS !== 'true' ||
    process.env.GITHUB_REPOSITORY !== 'internalforces/open-store-searcher' ||
    process.env.GITHUB_REF !== 'refs/heads/main' ||
    !/^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA ?? '') ||
    !/^[1-9][0-9]*$/.test(process.env.GITHUB_RUN_ID ?? '') ||
    !Number.isSafeInteger(runId)
  )
    throw new Error('Hosted initial import GitHub context required');
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (context.parentURL?.startsWith(pipeline.href) && /^\.\/[a-z0-9-]+\.js$/.test(specifier))
        return nextResolve(
          new URL(specifier.replace(/\.js$/, '.ts'), context.parentURL).href,
          context,
        );
      return nextResolve(specifier, context);
    },
  });
  try {
    const { validateInitialImportRun } = await import(new URL('initial-import-run.ts', pipeline));
    const bound = validateInitialImportRun(JSON.parse(json), {
      sha: process.env.GITHUB_SHA,
      runId,
      now: new Date().toISOString(),
    });
    console.log(JSON.stringify(bound));
  } finally {
    hooks.deregister();
  }
} catch {
  console.error('Publication blocked: initial run binding is invalid, mismatched or expired.');
  process.exitCode = 1;
}
