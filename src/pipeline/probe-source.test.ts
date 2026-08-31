import { describe, expect, test } from 'vitest';
import { DEFAULT_COLLECTOR_LIMITS } from './collector-types.js';
import { probeSourceContract } from './probe-source.js';

function acceptedResponses(total = 2 * 1024 * 1024): Response[] {
  return [
    new Response(null, { status: 204 }),
    new Response(new Uint8Array([0x50]), {
      status: 206,
      headers: {
        'content-range': `bytes 0-0/${total}`,
        'content-type': 'application/zip',
      },
    }),
  ];
}

function nextResponse(responses: Response[]): Response {
  const response = responses.shift();
  if (!response) throw new Error('test response queue exhausted');
  return response;
}

describe('probeSourceContract', () => {
  test('accepts the limit check and one-byte range contract', async () => {
    const responses = acceptedResponses(215_968_197);
    const result = await probeSourceContract({
      fetchImpl: async () => nextResponse(responses),
      limits: DEFAULT_COLLECTOR_LIMITS,
    });
    expect(result).toMatchObject({
      kind: 'accepted',
      evidence: {
        expectedBytes: 215_968_197,
        limitStatus: 204,
        rangeStatus: 206,
        providerFreshness: {
          updateCadence: 'daily',
          coverageLagDays: 2,
          sourceUrl: 'https://www.data.go.kr/data/15045016/fileData.do',
        },
      },
    });
  });

  test('does not retry an HTTP 429 limit denial', async () => {
    let calls = 0;
    const result = await probeSourceContract({
      fetchImpl: async () => {
        calls += 1;
        return new Response('wait', { status: 429 });
      },
      limits: DEFAULT_COLLECTOR_LIMITS,
    });
    expect(result).toMatchObject({ kind: 'rejected', code: 'download_limit_denied' });
    expect(calls).toBe(1);
  });

  test.each([
    [new Response('', { status: 200 }), 'range_contract_changed'],
    [
      new Response(new Uint8Array([1]), {
        status: 206,
        headers: { 'content-range': 'invalid', 'content-type': 'application/zip' },
      }),
      'range_contract_changed',
    ],
    [
      new Response(new Uint8Array([1, 2]), {
        status: 206,
        headers: { 'content-range': 'bytes 0-0/2097152', 'content-type': 'application/zip' },
      }),
      'range_contract_changed',
    ],
    [
      new Response('<html>denied</html>', {
        status: 206,
        headers: { 'content-range': 'bytes 0-0/2097152', 'content-type': 'text/html' },
      }),
      'http_contract_changed',
    ],
  ])('rejects an invalid range response', async (rangeResponse, code) => {
    const responses = [new Response(null, { status: 204 }), rangeResponse];
    await expect(
      probeSourceContract({
        fetchImpl: async () => nextResponse(responses),
        limits: DEFAULT_COLLECTOR_LIMITS,
      }),
    ).resolves.toMatchObject({ kind: 'rejected', code });
  });

  test('cancels the range body as soon as it exceeds one byte', async () => {
    let cancelled = false;
    let pulls = 0;
    const body = new ReadableStream<Uint8Array>(
      {
        pull(controller) {
          pulls += 1;
          if (pulls === 1) {
            controller.enqueue(new Uint8Array([0x50, 0x4b]));
            return;
          }
          controller.enqueue(new Uint8Array(1024));
          controller.close();
        },
        cancel() {
          cancelled = true;
        },
      },
      { highWaterMark: 0 },
    );
    const responses = [
      new Response(null, { status: 204 }),
      new Response(body, {
        status: 206,
        headers: {
          'content-range': 'bytes 0-0/2097152',
          'content-type': 'application/zip',
        },
      }),
    ];

    await expect(
      probeSourceContract({
        fetchImpl: async () => nextResponse(responses),
        limits: DEFAULT_COLLECTOR_LIMITS,
      }),
    ).resolves.toMatchObject({ kind: 'rejected', code: 'range_contract_changed' });
    expect(cancelled).toBe(true);
    expect(pulls).toBe(1);
  });

  test.each([
    [
      'non-206',
      { status: 200, headers: { 'content-type': 'application/zip' } },
      'range_contract_changed',
    ],
    [
      'HTML',
      {
        status: 206,
        headers: {
          'content-range': 'bytes 0-0/2097152',
          'content-type': 'text/html',
        },
      },
      'http_contract_changed',
    ],
    [
      'malformed Content-Range',
      {
        status: 206,
        headers: { 'content-range': 'invalid', 'content-type': 'application/zip' },
      },
      'range_contract_changed',
    ],
    [
      'out-of-bounds archive',
      {
        status: 206,
        headers: { 'content-range': 'bytes 0-0/1024', 'content-type': 'application/zip' },
      },
      'archive_size_out_of_bounds',
    ],
  ] as const)(
    'awaits cancellation of a rejected %s range body before returning',
    async (_label, responseInit, code) => {
      let resolveCancelStarted: (() => void) | undefined;
      const cancelStarted = new Promise<void>((resolve) => {
        resolveCancelStarted = resolve;
      });
      let resolveCancellation: (() => void) | undefined;
      const cancellationFinished = new Promise<void>((resolve) => {
        resolveCancellation = resolve;
      });
      const body = new ReadableStream<Uint8Array>(
        {
          cancel() {
            resolveCancelStarted?.();
            return cancellationFinished;
          },
        },
        { highWaterMark: 0 },
      );
      const responses = [new Response(null, { status: 204 }), new Response(body, responseInit)];

      const result = probeSourceContract({
        fetchImpl: async () => nextResponse(responses),
        limits: DEFAULT_COLLECTOR_LIMITS,
      });

      await expect(
        Promise.race([cancelStarted.then(() => 'cancel-started'), result.then(() => 'result')]),
      ).resolves.toBe('cancel-started');
      let settled = false;
      void result.then(() => {
        settled = true;
      });
      await Promise.resolve();
      expect(settled).toBe(false);
      resolveCancellation?.();
      await expect(result).resolves.toMatchObject({
        kind: 'rejected',
        code,
      });
    },
  );

  test('rejects foreign and excessive redirects', async () => {
    const foreign = await probeSourceContract({
      fetchImpl: async () =>
        new Response('', { status: 302, headers: { location: 'https://example.com/file' } }),
      limits: DEFAULT_COLLECTOR_LIMITS,
    });
    expect(foreign).toMatchObject({ kind: 'rejected', code: 'redirect_not_allowed' });

    let calls = 0;
    const excessive = await probeSourceContract({
      fetchImpl: async () => {
        calls += 1;
        return new Response('', {
          status: 302,
          headers: { location: `/redirect-${calls}` },
        });
      },
      limits: DEFAULT_COLLECTOR_LIMITS,
    });
    expect(excessive).toMatchObject({ kind: 'rejected', code: 'redirect_not_allowed' });
    expect(calls).toBe(4);
  });

  test('rejects a malformed redirect location without throwing', async () => {
    await expect(
      probeSourceContract({
        fetchImpl: async () => new Response('', { status: 302, headers: { location: 'http://[' } }),
        limits: DEFAULT_COLLECTOR_LIMITS,
      }),
    ).resolves.toMatchObject({ kind: 'rejected', code: 'redirect_not_allowed' });
  });

  test('rejects archive totals outside fixed bounds', async () => {
    for (const total of [1024, 600 * 1024 * 1024]) {
      const responses = acceptedResponses(total);
      await expect(
        probeSourceContract({
          fetchImpl: async () => nextResponse(responses),
          limits: DEFAULT_COLLECTOR_LIMITS,
        }),
      ).resolves.toMatchObject({ kind: 'rejected', code: 'archive_size_out_of_bounds' });
    }
  });
});
