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
    const target = new URL(location, currentUrl);
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
  let bytes: ArrayBuffer;
  try {
    bytes = await range.response.arrayBuffer();
  } catch {
    return rejected('range_contract_changed', 'Range body could not be read.');
  }
  if (bytes.byteLength !== 1) {
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
