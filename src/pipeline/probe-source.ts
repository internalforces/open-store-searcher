import type {
  CollectorLimits,
  CollectorRejectionCode,
  FetchLike,
  SourceEvidence,
} from './collector-types.js';
import {
  createProviderHeaders,
  isAllowedProviderUrl,
  SOURCE_ARCHIVE_URL,
  SOURCE_LIMIT_URL,
  SOURCE_PROVIDER_FRESHNESS,
} from './source-contract.js';

export type SourceProbeResult =
  | { kind: 'accepted'; evidence: SourceEvidence }
  | { kind: 'rejected'; code: CollectorRejectionCode; message: string };

export interface ProbeOptions {
  fetchImpl: FetchLike;
  limits: CollectorLimits;
  signal?: AbortSignal;
}

function rejected(code: CollectorRejectionCode, message: string): SourceProbeResult {
  return { kind: 'rejected', code, message };
}

async function hasExactlyOneByte(response: Response): Promise<boolean> {
  const reader = response.body?.getReader();
  if (!reader) return false;
  let byteLength = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return byteLength === 1;
      byteLength += value.byteLength;
      if (byteLength > 1) {
        await reader.cancel('range response exceeded one byte');
        return false;
      }
    }
  } catch {
    return false;
  } finally {
    reader.releaseLock();
  }
}

async function requestWithRedirects(
  url: string,
  init: RequestInit,
  options: ProbeOptions,
): Promise<{ response: Response; finalUrl: string } | SourceProbeResult> {
  let currentUrl = url;
  for (let redirects = 0; ; redirects += 1) {
    if (!isAllowedProviderUrl(currentUrl)) {
      return rejected('redirect_not_allowed', 'Provider URL is outside the approved HTTPS host.');
    }
    const timeoutSignal = AbortSignal.timeout(options.limits.httpProbeTimeoutMs);
    const signal = options.signal
      ? AbortSignal.any([options.signal, timeoutSignal])
      : timeoutSignal;
    let response: Response;
    try {
      response = await options.fetchImpl(currentUrl, { ...init, redirect: 'manual', signal });
    } catch {
      return rejected('http_contract_changed', 'Provider probe request failed.');
    }
    if (response.status < 300 || response.status >= 400) return { response, finalUrl: currentUrl };
    const location = response.headers.get('location');
    if (!location || redirects >= options.limits.maxRedirects) {
      return rejected('redirect_not_allowed', 'Provider redirect limit or contract changed.');
    }
    let target: URL;
    try {
      target = new URL(location, currentUrl);
    } catch {
      return rejected('redirect_not_allowed', 'Provider redirect location is malformed.');
    }
    if (!isAllowedProviderUrl(target)) {
      return rejected('redirect_not_allowed', 'Provider redirected outside the approved host.');
    }
    currentUrl = target.href;
  }
}

export async function probeSourceContract(options: ProbeOptions): Promise<SourceProbeResult> {
  const limit = await requestWithRedirects(
    SOURCE_LIMIT_URL,
    { method: 'GET', headers: createProviderHeaders('limit') },
    options,
  );
  if ('kind' in limit) return limit;
  if (limit.response.status === 429) {
    return rejected('download_limit_denied', 'Provider denied the download limit check.');
  }
  if (!limit.response.ok) {
    return rejected(
      'http_contract_changed',
      'Download limit endpoint returned a non-success status.',
    );
  }

  const range = await requestWithRedirects(
    SOURCE_ARCHIVE_URL,
    {
      method: 'GET',
      headers: { ...createProviderHeaders('archive'), range: 'bytes=0-0' },
    },
    options,
  );
  if ('kind' in range) return range;
  const contentType = range.response.headers.get('content-type')?.toLowerCase() ?? '';
  if (contentType.includes('text/html')) {
    return rejected('http_contract_changed', 'Provider returned HTML instead of archive bytes.');
  }
  if (range.response.status !== 206) {
    return rejected('range_contract_changed', 'Provider did not honor the one-byte range request.');
  }
  const match = /^bytes 0-0\/(\d+)$/.exec(range.response.headers.get('content-range') ?? '');
  if (!match) return rejected('range_contract_changed', 'Content-Range is malformed.');
  const expectedBytes = Number(match[1]);
  if (
    !Number.isSafeInteger(expectedBytes) ||
    expectedBytes < options.limits.minArchiveBytes ||
    expectedBytes > options.limits.maxArchiveBytes
  ) {
    return rejected('archive_size_out_of_bounds', 'Archive size is outside approved bounds.');
  }
  if (!(await hasExactlyOneByte(range.response))) {
    return rejected('range_contract_changed', 'Range body was not exactly one byte.');
  }
  return {
    kind: 'accepted',
    evidence: {
      expectedBytes,
      finalUrl: range.finalUrl,
      limitStatus: limit.response.status,
      rangeStatus: range.response.status,
      providerFreshness: SOURCE_PROVIDER_FRESHNESS,
    },
  };
}
