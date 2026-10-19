// Dependency-free post-approval guard. Runs from current main; never imports restored code.
import { createHash } from 'node:crypto';
const DESCRIPTOR_URL = 'https://internalforces.github.io/open-store-searcher/release.json';
const MAX_BYTES = 8 * 1024 * 1024;
try {
  const [url, expectedStatus, expectedSha] = process.argv.slice(2);
  if (
    process.argv.length !== 5 ||
    url !== DESCRIPTOR_URL ||
    !(
      (expectedStatus === '200' && /^[0-9a-f]{64}$/.test(expectedSha)) ||
      (expectedStatus === '404' && expectedSha === 'absent')
    )
  )
    throw new Error('Invalid public descriptor guard contract');
  const controller = new AbortController();
  const deadline = Date.now() + 15 * 60 * 1000;
  let timer;
  let rejectTimeout;
  const timeout = new Promise((_, reject) => {
    rejectTimeout = reject;
  });
  const reset = () => {
    clearTimeout(timer);
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error('Public descriptor overall timeout');
    timer = setTimeout(
      () => {
        controller.abort();
        rejectTimeout(new Error('Public descriptor read timed out'));
      },
      Math.min(30_000, remaining),
    );
  };
  let reader;
  let response;
  try {
    reset();
    response = await Promise.race([
      fetch(url, {
        redirect: 'error',
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
        signal: controller.signal,
      }),
      timeout,
    ]);
    if (response.redirected || response.status !== Number(expectedStatus))
      throw new Error('Public descriptor state changed or is uncertain');
    let actualSha = null;
    if (response.status === 200) {
      if (!response.body) throw new Error('Public descriptor body missing');
      reader = response.body.getReader();
      const hash = createHash('sha256');
      let length = 0;
      while (true) {
        reset();
        const chunk = await Promise.race([reader.read(), timeout]);
        if (chunk.done) break;
        length += chunk.value.byteLength;
        if (length > MAX_BYTES) throw new Error('Public descriptor exceeds byte limit');
        hash.update(chunk.value);
      }
      actualSha = hash.digest('hex');
      if (actualSha !== expectedSha) throw new Error('Public descriptor changed after preparation');
    }
    console.log(
      JSON.stringify({
        version: 1,
        kind: 'publication-state-unchanged',
        status: response.status,
        releaseSha256: actualSha,
      }),
    );
  } finally {
    clearTimeout(timer);
    controller.abort();
    if (reader) {
      void reader.cancel().catch(() => {});
      reader.releaseLock();
    } else if (response?.body) void response.body.cancel().catch(() => {});
  }
} catch {
  console.error('Publication blocked: public descriptor changed or could not be verified.');
  process.exitCode = 1;
}
