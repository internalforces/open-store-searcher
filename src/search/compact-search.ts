import type { DisplayRecord } from '../app/display-data.js';
import {
  type CompactBlock,
  type CompactManifest,
  columnValue,
  type Dictionaries,
  materializeRecord,
  requireCompact,
} from '../shared/compact-data.js';
import { PackedStringValues } from '../shared/packed-string-values.js';
import {
  type AddressParts,
  compareSearchAddressFlags,
  parseSearchAddress,
} from './compare-search-address.js';
import { prepareSearchQuery, projectSearchName } from './prepare-search-query.js';
import { createAddressTarget, PreparedAddresses } from './prepared-addresses.js';
import {
  type CandidateMatch,
  compareCandidateRank,
  matchesLiteralAddressKey,
  matchName,
  prepareScoringQuery,
  type ScoredCandidate,
  type ScoringEntry,
  type ScoringQuery,
  type SearchResult,
  scoreCandidate,
  scoreCandidateRank,
} from './search-candidates.js';

const PAGE_SIZE = 20;
const PREPARE_BATCH = 512;
const SEARCH_BATCH = 2_048;
const SORT_BATCH = 8_192;
const COOPERATIVE_BUDGET_MS = 8;
const EMPTY_ORDINALS = new Uint32Array();
const NAME_MATCHES = ['none', 'exact', 'partial'] as const;
const ADDRESS_MATCHES = ['none', 'partial', 'core', 'exact'] as const;

/** Own numeric storage without mutating the validated input or changing reference values. */
function packBlockReferences(block: CompactBlock): CompactBlock {
  return {
    ...block,
    columns: block.columns.map((column) => {
      if ('values' in column) {
        if (column.values instanceof PackedStringValues) return column;
        return column.values.every((value): value is string => typeof value === 'string')
          ? { values: new PackedStringValues(column.values) }
          : column;
      }
      requireCompact(
        column.refs.every(
          (reference) =>
            Number.isSafeInteger(reference) && reference >= 0 && reference <= 0xffffffff,
        ),
      );
      return { ...column, refs: new Uint32Array(column.refs) };
    }),
  };
}

/** Necessary character membership only: collisions admit extra comparisons, never drop a match. */
function characterMask(value: string): number {
  let mask = 0;
  for (let index = 0; index < value.length; index++)
    mask |= 1 << (Math.imul(value.charCodeAt(index), 0x9e3779b1) >>> 27);
  return mask >>> 0;
}

interface PreparedBlock {
  readonly block: CompactBlock;
  readonly evidence: CompactBlock;
  readonly nameRefs: Uint32Array;
  readonly roadRefs: Uint32Array;
  readonly parcelRefs: Uint32Array;
}

interface SearchWorkspace {
  readonly names: Uint8Array;
  readonly addresses: Uint8Array;
  readonly addressRanks: Uint8Array;
  readonly conflicts: Uint8Array;
  scores: Int16Array | null;
}

interface SearchState {
  readonly validation: ReturnType<typeof prepareSearchQuery>;
  readonly scoring: ScoringQuery | null;
  readonly eligibleOrdinals: Uint32Array;
  readonly similarOrdinals: Uint32Array;
}

function abortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError');
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

async function cooperativeYield(signal?: AbortSignal): Promise<void> {
  throwIfAborted(signal);
  const scheduler = (globalThis as unknown as { scheduler?: { yield: () => Promise<void> } })
    .scheduler;
  if (typeof scheduler?.yield === 'function') await scheduler.yield();
  else await new Promise<void>((resolve) => setTimeout(resolve, 0));
  throwIfAborted(signal);
}

/** Keep the first cancellation boundary, then yield after actual work consumes a time slice. */
function cooperativeCheckpoint(signal?: AbortSignal): () => Promise<void> {
  let yielded = false;
  let resumedAt = performance.now();
  return async () => {
    throwIfAborted(signal);
    if (yielded && performance.now() - resumedAt < COOPERATIVE_BUDGET_MS) return;
    await cooperativeYield(signal);
    yielded = true;
    resumedAt = performance.now();
  };
}

async function sortOrdinals(
  values: ArrayLike<number>,
  compare: (left: number, right: number) => number,
  signal?: AbortSignal,
  checkpoint = cooperativeCheckpoint(signal),
): Promise<Uint32Array> {
  let source = Uint32Array.from(values);
  if (source.length < 2) {
    throwIfAborted(signal);
    return source;
  }
  let target = new Uint32Array(source.length);
  let work = 0;
  for (let width = 1; width < source.length; width *= 2) {
    for (let left = 0; left < source.length; left += width * 2) {
      const middle = Math.min(left + width, source.length);
      const right = Math.min(left + width * 2, source.length);
      let first = left;
      let second = middle;
      let output = left;
      while (first < middle && second < right) {
        if (compare(source[first] as number, source[second] as number) <= 0) {
          target[output++] = source[first++] as number;
        } else {
          target[output++] = source[second++] as number;
        }
        if (++work >= SORT_BATCH) {
          work = 0;
          await checkpoint();
        }
      }
      while (first < middle) target[output++] = source[first++] as number;
      while (second < right) target[output++] = source[second++] as number;
    }
    [source, target] = [target, source];
    await checkpoint();
  }
  return source;
}

/** Preserve complete score/conflict/ID ranking without record-sized merge buffers. */
async function rankCandidates(
  counts: readonly Map<number, number>[],
  eligibleCount: number,
  similarCount: number,
  scores: Int16Array,
  flags: Uint8Array,
  identifierOrder: Uint32Array,
  signal?: AbortSignal,
): Promise<{ eligibleOrdinals: Uint32Array; similarOrdinals: Uint32Array }> {
  const eligibleOrdinals = new Uint32Array(eligibleCount);
  const similarOrdinals = new Uint32Array(similarCount);
  const checkpoint = cooperativeCheckpoint(signal);
  await checkpoint();
  if (!eligibleCount && !similarCount) return { eligibleOrdinals, similarOrdinals };

  // There are few observed scores. Count rank groups, then place candidates in
  // the immutable full-ID order instead of repeatedly comparing those strings.
  const positions = counts.map(() => new Map<number, number>());
  let offset = 0;
  for (let kind = 0; kind < counts.length; kind++) {
    if (kind < 2) offset = 0;
    const bucket = positions[kind] as Map<number, number>;
    for (const [score, count] of [...(counts[kind] as Map<number, number>)].sort(([a], [b]) =>
      compareCandidateRank(a, '', b, ''),
    )) {
      bucket.set(score, offset);
      offset += count;
    }
  }
  for (let index = 0; index < identifierOrder.length; index++) {
    const ordinal = identifierOrder[index] as number;
    const kind = flags[ordinal] as number;
    if (kind) {
      const bucket = positions[kind - 1] as Map<number, number>;
      const score = scores[ordinal] as number;
      const position = bucket.get(score) as number;
      (kind === 1 ? eligibleOrdinals : similarOrdinals)[position] = ordinal;
      bucket.set(score, position + 1);
    }
    if ((index + 1) % SORT_BATCH === 0) await checkpoint();
  }
  await cooperativeYield(signal);
  return { eligibleOrdinals, similarOrdinals };
}

/** Compact in-memory search storage for a validated manifest generation. */
export class CompactSearch {
  readonly metadata: CompactManifest['metadata'];
  readonly recordCount: number;

  private readonly manifest: CompactManifest;
  private blocks: readonly CompactBlock[] | null;
  private readonly dictionaries: Dictionaries;
  private preparedBlocks: readonly PreparedBlock[] | null = null;
  private nameProjections: readonly string[] = [];
  private addressProjections = new PreparedAddresses();
  private nameMasks = new Uint16Array();
  private addressMasks = new Uint16Array();
  private state: SearchState | null = null;
  private identifierOrder: Uint32Array = EMPTY_ORDINALS;
  private workspace: SearchWorkspace | null = null;

  constructor(
    manifest: CompactManifest,
    blocks: readonly CompactBlock[],
    dictionaries: Dictionaries,
  ) {
    this.manifest = manifest;
    this.blocks = blocks;
    this.dictionaries = dictionaries;
    this.metadata = manifest.metadata;
    this.recordCount = manifest.recordCount;
  }

  async prepare(signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    if (this.preparedBlocks) return;
    requireCompact(this.blocks);
    requireCompact(this.dictionaries.length === 21);
    const searchBlocks = this.blocks
      .filter((block) => block.role === 'search')
      .toSorted((left, right) => left.start - right.start);
    const evidenceBlocks = this.blocks
      .filter((block) => block.role === 'evidence')
      .toSorted((left, right) => left.start - right.start);
    requireCompact(searchBlocks.length === evidenceBlocks.length);
    // Replace each processed pair with its owned copy. Cancellation can retry
    // this complete mixture while obsolete numeric arrays become collectible.
    const workingBlocks = searchBlocks.flatMap((block, index) => [
      block,
      evidenceBlocks[index] as CompactBlock,
    ]);
    this.blocks = workingBlocks;

    const names: string[] = [];
    const nameMasks: number[] = [];
    const identifiers: string[] = [];
    const identifierOrdinals = new Uint32Array(this.recordCount);
    const addresses = new PreparedAddresses();
    const addressMasks: number[] = [];
    const nameIndexes = new Map<string, number>();
    const addressIndexes = new Map<string, number>();
    const prepared: PreparedBlock[] = [];
    let expectedStart = 0;
    let preparedRows = 0;
    const checkpoint = cooperativeCheckpoint(signal);
    const nameIndex = (value: string) => {
      const existing = nameIndexes.get(value);
      if (existing !== undefined) return existing;
      const next = names.length;
      const key = projectSearchName(value);
      names.push(key);
      const mask = characterMask(key);
      nameMasks.push(mask & 0xffff, mask >>> 16);
      nameIndexes.set(value, next);
      return next;
    };
    const addressIndex = (value: string) => {
      const existing = addressIndexes.get(value);
      if (existing !== undefined) return existing;
      const next = addresses.length;
      const address = parseSearchAddress(value);
      addresses.add(address, value);
      const mask = characterMask(address.key);
      addressMasks.push(mask & 0xffff, mask >>> 16);
      addressIndexes.set(value, next);
      return next;
    };

    for (let blockIndex = 0; blockIndex < searchBlocks.length; blockIndex++) {
      const block = searchBlocks[blockIndex] as CompactBlock;
      const evidence = evidenceBlocks[blockIndex] as CompactBlock;
      requireCompact(
        block.version === 1 &&
          evidence.version === 1 &&
          block.archiveSha256 === this.manifest.archiveSha256 &&
          evidence.archiveSha256 === this.manifest.archiveSha256 &&
          block.start === expectedStart &&
          evidence.start === block.start &&
          evidence.count === block.count &&
          block.columns.length === 4 &&
          evidence.columns.length === 17,
      );
      const nameRefs = new Uint32Array(block.count);
      const roadRefs = new Uint32Array(block.count);
      const parcelRefs = new Uint32Array(block.count);
      const [identifierColumn, nameColumn, roadAddressColumn, parcelAddressColumn] = block.columns;
      requireCompact(identifierColumn && nameColumn && roadAddressColumn && parcelAddressColumn);
      for (let row = 0; row < block.count; row++) {
        const identifier = columnValue(identifierColumn, row, this.dictionaries);
        const name = columnValue(nameColumn, row, this.dictionaries);
        const roadAddress = columnValue(roadAddressColumn, row, this.dictionaries);
        const parcelAddress = columnValue(parcelAddressColumn, row, this.dictionaries);
        requireCompact(
          typeof identifier === 'string' &&
            typeof name === 'string' &&
            typeof roadAddress === 'string' &&
            typeof parcelAddress === 'string',
        );
        identifierOrdinals[identifiers.length] = identifiers.length;
        identifiers.push(identifier);
        nameRefs[row] = nameIndex(name);
        roadRefs[row] = addressIndex(roadAddress);
        parcelRefs[row] = addressIndex(parcelAddress);
        if (++preparedRows >= PREPARE_BATCH) {
          preparedRows = 0;
          await checkpoint();
        }
      }
      const packedBlock = packBlockReferences(block);
      const packedEvidence = packBlockReferences(evidence);
      prepared.push({
        block: packedBlock,
        evidence: packedEvidence,
        nameRefs,
        roadRefs,
        parcelRefs,
      });
      workingBlocks[blockIndex * 2] = packedBlock;
      workingBlocks[blockIndex * 2 + 1] = packedEvidence;
      searchBlocks[blockIndex] = packedBlock;
      evidenceBlocks[blockIndex] = packedEvidence;
      expectedStart += block.count;
      await checkpoint();
    }
    requireCompact(expectedStart === this.recordCount);

    // These lookup maps are used only while collecting projections. Release their
    // backing storage before ordering IDs, rather than retaining it until readiness.
    nameIndexes.clear();
    addressIndexes.clear();
    addresses.seal();

    // Preserve all 32 membership bits as two small integers, avoiding boxed
    // unsigned values during hot reads without weakening projection rejection.
    const preparedNameMasks = Uint16Array.from(nameMasks);
    const preparedAddressMasks = Uint16Array.from(addressMasks);
    nameMasks.length = 0;
    addressMasks.length = 0;
    // Query-sized scratch belongs to preparation, not the first user search.
    const workspace: SearchWorkspace = {
      names: new Uint8Array(names.length),
      addresses: new Uint8Array(addresses.length),
      addressRanks: new Uint8Array(addresses.length),
      conflicts: new Uint8Array(this.recordCount),
      scores: new Int16Array(this.recordCount),
    };

    // District-only candidates all have score zero. Sort immutable IDs once, then
    // partition that order by conflict instead of comparing strings on every query.
    const identifierOrder = await sortOrdinals(
      identifierOrdinals,
      (left, right) => {
        const a = identifiers[left] as string;
        const b = identifiers[right] as string;
        return a < b ? -1 : a > b ? 1 : 0;
      },
      signal,
      checkpoint,
    );

    // loadCompactSnapshot owns global identity validation before constructing this store.
    throwIfAborted(signal);
    this.identifierOrder = identifierOrder;
    this.preparedBlocks = prepared;
    this.nameProjections = names;
    this.addressProjections = addresses;
    this.nameMasks = preparedNameMasks;
    this.addressMasks = preparedAddressMasks;
    this.workspace = workspace;
    this.blocks = null;
  }

  async search(original: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const blocks = this.preparedBlocks;
    if (!blocks) throw new Error('Compact search is not prepared');
    const validation = prepareSearchQuery(original);
    if (!validation.ok) {
      this.state = {
        validation,
        scoring: null,
        eligibleOrdinals: EMPTY_ORDINALS,
        similarOrdinals: EMPTY_ORDINALS,
      };
      return;
    }

    // Lease scratch storage: overlapping searches must never share mutable flags.
    const workspace = this.workspace ?? {
      names: new Uint8Array(this.nameProjections.length),
      addresses: new Uint8Array(this.addressProjections.length),
      addressRanks: new Uint8Array(this.addressProjections.length),
      conflicts: new Uint8Array(this.recordCount),
      scores: null,
    };
    this.workspace = null;
    try {
      await this.searchPrepared(validation, blocks, workspace, signal);
    } finally {
      // Published results contain independent ordinal arrays, never scratch storage.
      // Clear all query-derived flags before retaining at most one idle workspace.
      workspace.names.fill(0);
      workspace.addresses.fill(0);
      workspace.addressRanks.fill(0);
      workspace.conflicts.fill(0);
      workspace.scores?.fill(0);
      this.workspace ??= workspace;
    }
  }

  private async searchPrepared(
    validation: Extract<ReturnType<typeof prepareSearchQuery>, { ok: true }>,
    blocks: readonly PreparedBlock[],
    workspace: SearchWorkspace,
    signal?: AbortSignal,
  ): Promise<void> {
    const scoring = prepareScoringQuery(validation);
    let eligibleCount = 0;
    let similarCount = 0;
    const rankCounts = [
      new Map<number, number>(),
      new Map<number, number>(),
      new Map<number, number>(),
    ];
    const addressQuery = scoring.query.address;
    const projections = this.addressProjections;
    const queryDistrict = addressQuery ? projections.componentReference(addressQuery.district) : 0;
    const queryAnchor = addressQuery
      ? projections.componentReference(
          addressQuery.family === 'road' ? addressQuery.road : addressQuery.locality,
        )
      : 0;
    const addressTarget = createAddressTarget();
    const districtQuery =
      !scoring.query.nameKey &&
      addressQuery?.district &&
      addressQuery.family === 'unspecified' &&
      !addressQuery.road &&
      !addressQuery.locality &&
      !addressQuery.number &&
      !addressQuery.strong &&
      !addressQuery.core &&
      !addressQuery.ambiguous
        ? addressQuery
        : null;
    // Lossless projection retrieval: score only rows that can satisfy the oracle's
    // name, literal-address, address-match or broad-relevance acceptance predicate.
    // Every ordinal is still visited; no posting cutoff or result cap is applied.
    const names = workspace.names;
    const addresses = workspace.addresses;
    const queryNameMask = characterMask(scoring.query.nameKey);
    const literalNameMask =
      scoring.query.nameKey === scoring.validation.nameKey
        ? queryNameMask
        : characterMask(scoring.validation.nameKey);
    // Tokens may overlap in one candidate word, so separators are not required characters.
    const literalAddressMask = characterMask(
      scoring.literalTokens.map(({ value }) => value).join(''),
    );
    const nameMatches = (
      query: string,
      queryMask: number,
      key: string,
      candidateLow: number,
      candidateHigh: number,
    ) => {
      if (!query || !key) return 0;
      const queryLow = queryMask & 0xffff;
      const queryHigh = queryMask >>> 16;
      const shorterQuery = query.length <= key.length;
      if (
        (queryLow & candidateLow) !== (shorterQuery ? queryLow : candidateLow) ||
        (queryHigh & candidateHigh) !== (shorterQuery ? queryHigh : candidateHigh)
      )
        return 0;
      const match = matchName(query, key);
      return match === 'exact' ? 1 : match === 'partial' ? 2 : 0;
    };
    const computeName = (reference: number) => {
      const key = this.nameProjections[reference] as string;
      const candidateLow = this.nameMasks[reference * 2] as number;
      const candidateHigh = this.nameMasks[reference * 2 + 1] as number;
      const interpreted = nameMatches(
        scoring.query.nameKey,
        queryNameMask,
        key,
        candidateLow,
        candidateHigh,
      );
      const literal =
        !interpreted && scoring.query.nameKey !== scoring.validation.nameKey
          ? nameMatches(
              scoring.validation.nameKey,
              literalNameMask,
              key,
              candidateLow,
              candidateHigh,
            )
          : 0;
      // Keep match kind and fallback provenance; bit0 distinguishes cached none.
      names[reference] = 1 | (interpreted << 1) | (literal << 3);
      return names[reference] as number;
    };
    const computeAddress = (reference: number) => {
      if (scoring.query.address) {
        const query = scoring.query.address;
        // Conservatively retain every relevance or exact-key path. Detailed conflicts,
        // ambiguity and confidence are still decided by the unchanged scorer below.
        addresses[reference] =
          projections.isRelevant(reference, queryDistrict, queryAnchor, query.family) ||
          (query.key && query.key === projections.key(reference))
            ? 2
            : 1;
      } else
        addresses[reference] =
          ((this.addressMasks[reference * 2] as number) & (literalAddressMask & 0xffff)) ===
            (literalAddressMask & 0xffff) &&
          ((this.addressMasks[reference * 2 + 1] as number) & (literalAddressMask >>> 16)) ===
            literalAddressMask >>> 16 &&
          matchesLiteralAddressKey(projections.key(reference), scoring.literalTokens)
            ? 2
            : 1;
      return addresses[reference] as number;
    };
    // Cache each distinct field's primitive comparison even when its name qualifies;
    // detailed reasons are materialized by the original scorer only for a page.
    const addressRanks = workspace.addressRanks;
    const addressRank = (reference: number): number => {
      const ranks = addressRanks as Uint8Array;
      if (!ranks[reference]) {
        const candidate = projections.read(reference, addressTarget);
        ranks[reference] = compareSearchAddressFlags(addressQuery as AddressParts, candidate);
      }
      return ranks[reference] as number;
    };
    if (!districtQuery && !workspace.scores) workspace.scores = new Int16Array(this.recordCount);
    const scores = districtQuery ? null : workspace.scores;
    const conflicts = workspace.conflicts;
    const admit = (ordinal: number, score: number, low: boolean, conflict: boolean) => {
      const kind = low ? 1 + Number(conflict) : 0;
      const counts = rankCounts[kind] as Map<number, number>;
      counts.set(score, (counts.get(score) ?? 0) + 1);
      (scores as Int16Array)[ordinal] = score;
      conflicts[ordinal] = kind + 1;
      if (low) similarCount++;
      else eligibleCount++;
    };
    let districtCount = 0;
    let nonconflictingCount = 0;
    let scanned = 0;
    const checkpoint = cooperativeCheckpoint(signal);
    for (const block of blocks) {
      for (let row = 0; row < block.block.count; row++) {
        const ordinal = block.block.start + row;
        const nameReference = block.nameRefs[row] as number;
        const roadReference = block.roadRefs[row] as number;
        const parcelReference = block.parcelRefs[row] as number;
        const nameFlags = names[nameReference] || computeName(nameReference);
        const namePossible = nameFlags !== 1;
        const possible =
          namePossible ||
          (addresses[roadReference] || computeAddress(roadReference)) === 2 ||
          (addresses[parcelReference] || computeAddress(parcelReference)) === 2;
        if (possible && districtQuery) {
          // A district without a core address cannot earn a score or eligibility.
          // Its only comparable conflict is district; defer full reasons to page materialization.
          const conflict =
            projections.hasConflictingDistrict(roadReference, queryDistrict) ||
            projections.hasConflictingDistrict(parcelReference, queryDistrict);
          conflicts[ordinal] = conflict ? 2 : 1;
          districtCount++;
          if (!conflict) nonconflictingCount++;
        } else if (possible && !addressQuery) {
          // Exact name/literal admission is already known. Without an interpreted
          // address the shared scorer always ranks at zero, low and no conflict.
          admit(ordinal, 0, true, false);
        } else if (possible && addressQuery) {
          const road = addressRank(roadReference);
          const parcel = addressRank(parcelReference);
          const match = Math.max((road >> 1) & 3, (parcel >> 1) & 3);
          if (namePossible || match || (road | parcel) & 16) {
            const conflict = Boolean((road | parcel) & 8);
            const flags = nameFlags;
            const interpreted = (flags >> 1) & 3;
            const literal = (flags >> 3) & 3;
            const rank = scoreCandidateRank(
              NAME_MATCHES[interpreted || literal] as 'none' | 'exact' | 'partial',
              ADDRESS_MATCHES[match] as 'none' | 'partial' | 'core' | 'exact',
              scoring.query,
              Boolean(this.nameProjections[nameReference]),
              conflict,
              Boolean((road | parcel) & 32),
              !interpreted && literal !== 0,
            );
            admit(ordinal, rank >> 2, (rank & 3) === 0, conflict);
          }
        }
        if (++scanned >= SEARCH_BATCH) {
          scanned = 0;
          await checkpoint();
        }
      }
    }

    if (districtQuery) {
      const similarOrdinals = new Uint32Array(districtCount);
      let first = 0;
      let second = nonconflictingCount;
      const rankingCheckpoint = cooperativeCheckpoint(signal);
      await rankingCheckpoint();
      for (let index = 0; index < this.identifierOrder.length; index++) {
        const ordinal = this.identifierOrder[index] as number;
        const kind = conflicts[ordinal];
        if (kind === 1) similarOrdinals[first++] = ordinal;
        else if (kind === 2) similarOrdinals[second++] = ordinal;
        if ((index + 1) % SORT_BATCH === 0) await rankingCheckpoint();
      }
      // Allow a queued cancellation to run even when the partition fits in one slice.
      await cooperativeYield(signal);
      this.state = { validation, scoring, eligibleOrdinals: EMPTY_ORDINALS, similarOrdinals };
      return;
    }

    const { eligibleOrdinals, similarOrdinals } = await rankCandidates(
      rankCounts,
      eligibleCount,
      similarCount,
      scores as Int16Array,
      conflicts,
      this.identifierOrder,
      signal,
    );
    throwIfAborted(signal);
    this.state = { validation, scoring, eligibleOrdinals, similarOrdinals };
  }

  page(requestedPage: number): SearchResult<DisplayRecord> & { page: number } {
    const state = this.state;
    if (!state) throw new Error('Compact search has no result');
    const lastPage = Math.max(0, Math.ceil(state.similarOrdinals.length / PAGE_SIZE) - 1);
    const page =
      Number.isSafeInteger(requestedPage) && requestedPage >= 0 && requestedPage <= lastPage
        ? requestedPage
        : 0;
    const topMatches = state.scoring
      ? Array.from(state.eligibleOrdinals.slice(0, 3), (ordinal) =>
          this.materializeMatch(ordinal, state.scoring as ScoringQuery),
        )
      : [];
    const start = page * PAGE_SIZE;
    const similarCandidates = state.scoring
      ? Array.from(state.similarOrdinals.slice(start, start + PAGE_SIZE), (ordinal) =>
          this.materializeMatch(ordinal, state.scoring as ScoringQuery),
        )
      : [];
    const [first, second] = topMatches;
    const ambiguousTop = Boolean(first && second && first.score === second.score);
    const primaryMatch = first?.confidence === 'high' && !ambiguousTop ? first : null;
    return {
      page,
      validation: state.validation,
      topMatches,
      similarCandidates,
      eligibleCount: state.eligibleOrdinals.length,
      similarCount: state.similarOrdinals.length,
      primaryMatch,
      ambiguousTop,
      diagnostics: { invalidRecordCount: 0, duplicateIdRecordCount: 0 },
    };
  }

  private score(block: PreparedBlock, row: number, scoring: ScoringQuery): ScoredCandidate | null {
    const road = this.addressProjections.read(block.roadRefs[row] as number);
    const parcel = this.addressProjections.read(block.parcelRefs[row] as number);
    const entry: ScoringEntry = {
      nameKey: this.nameProjections[block.nameRefs[row] as number] as string,
      addresses: [road, parcel],
      addressTokens: scoring.query.address
        ? []
        : [road.key ? road.key.split(' ') : [], parcel.key ? parcel.key.split(' ') : []],
    };
    return scoreCandidate(entry, scoring.query, scoring.validation, scoring.literalTokens);
  }

  private materializeMatch(ordinal: number, scoring: ScoringQuery): CandidateMatch<DisplayRecord> {
    const { block, row } = this.locate(ordinal);
    const scored = this.score(block, row, scoring);
    requireCompact(scored);
    const searchValues = block.block.columns.map((column) =>
      columnValue(column, row, this.dictionaries),
    );
    const evidenceValues = block.evidence.columns.map((column) =>
      columnValue(column, row, this.dictionaries),
    );
    return { record: materializeRecord([...searchValues, ...evidenceValues]), ...scored };
  }

  private locate(ordinal: number): { block: PreparedBlock; row: number } {
    return this.locateIn(this.preparedBlocks as readonly PreparedBlock[], ordinal);
  }

  private locateIn(
    blocks: readonly PreparedBlock[],
    ordinal: number,
  ): { block: PreparedBlock; row: number } {
    let low = 0;
    let high = blocks.length - 1;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      const block = blocks[middle] as PreparedBlock;
      if (ordinal < block.block.start) high = middle - 1;
      else if (ordinal >= block.block.start + block.block.count) low = middle + 1;
      else return { block, row: ordinal - block.block.start };
    }
    throw new Error('Invalid compact ordinal');
  }
}
