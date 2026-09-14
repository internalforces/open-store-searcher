import type { DisplayRecord } from '../app/display-data.js';
import {
  type CompactBlock,
  type CompactManifest,
  type Dictionaries,
  columnValue,
  materializeRecord,
  requireCompact,
} from '../shared/compact-data.js';
import {
  type AddressParts,
  parseSearchAddress,
  compareSearchAddress,
} from './compare-search-address.js';
import { prepareSearchQuery, projectSearchText } from './prepare-search-query.js';
import {
  type CandidateMatch,
  type ScoredCandidate,
  type ScoringEntry,
  type ScoringQuery,
  type SearchResult,
  compareCandidateRank,
  compareSimilarCandidateRank,
  hasConflict,
  matchName,
  matchesLiteralAddress,
  prepareScoringQuery,
  scoreCandidate,
} from './search-candidates.js';

const PAGE_SIZE = 20;
const PREPARE_BATCH = 512;
const SEARCH_BATCH = 2_048;
const SORT_BATCH = 8_192;
const EMPTY_ORDINALS = new Uint32Array();

interface AddressProjection {
  readonly parts: AddressParts;
  readonly tokens: readonly string[];
}

interface PreparedBlock {
  readonly block: CompactBlock;
  readonly evidence: CompactBlock;
  readonly nameRefs: Uint32Array;
  readonly roadRefs: Uint32Array;
  readonly parcelRefs: Uint32Array;
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

async function sortOrdinals(
  values: readonly number[],
  compare: (left: number, right: number) => number,
  signal?: AbortSignal,
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
          await cooperativeYield(signal);
        }
      }
      while (first < middle) target[output++] = source[first++] as number;
      while (second < right) target[output++] = source[second++] as number;
    }
    [source, target] = [target, source];
    await cooperativeYield(signal);
  }
  return source;
}

/** Compact in-memory search storage for a validated manifest generation. */
export class CompactSearch {
  readonly metadata: CompactManifest['metadata'];
  readonly recordCount: number;

  private readonly manifest: CompactManifest;
  private readonly blocks: readonly CompactBlock[];
  private readonly dictionaries: Dictionaries;
  private preparedBlocks: readonly PreparedBlock[] | null = null;
  private nameProjections: readonly string[] = [];
  private addressProjections: readonly AddressProjection[] = [];
  private state: SearchState | null = null;
  private identifiers: readonly string[] = [];

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
    requireCompact(this.dictionaries.length === 21);
    const searchBlocks = this.blocks
      .filter((block) => block.role === 'search')
      .toSorted((left, right) => left.start - right.start);
    const evidenceBlocks = this.blocks
      .filter((block) => block.role === 'evidence')
      .toSorted((left, right) => left.start - right.start);
    requireCompact(searchBlocks.length === evidenceBlocks.length);

    const names: string[] = [];
    const identifiers: string[] = [];
    const addresses: AddressProjection[] = [];
    const nameIndexes = new Map<string, number>();
    const addressIndexes = new Map<string, number>();
    const prepared: PreparedBlock[] = [];
    let expectedStart = 0;
    let preparedRows = 0;
    const nameIndex = (value: string) => {
      const existing = nameIndexes.get(value);
      if (existing !== undefined) return existing;
      const next = names.length;
      names.push(projectSearchText(value).nameKey);
      nameIndexes.set(value, next);
      return next;
    };
    const addressIndex = (value: string) => {
      const existing = addressIndexes.get(value);
      if (existing !== undefined) return existing;
      const next = addresses.length;
      const parts = parseSearchAddress(value);
      addresses.push({ parts, tokens: parts.key ? parts.key.split(' ') : [] });
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
        identifiers.push(identifier);
        nameRefs[row] = nameIndex(name);
        roadRefs[row] = addressIndex(roadAddress);
        parcelRefs[row] = addressIndex(parcelAddress);
        if (++preparedRows >= PREPARE_BATCH) {
          preparedRows = 0;
          await cooperativeYield(signal);
        }
      }
      prepared.push({ block, evidence, nameRefs, roadRefs, parcelRefs });
      expectedStart += block.count;
    }
    requireCompact(expectedStart === this.recordCount);

    // loadCompactSnapshot owns global identity validation before constructing this store.
    throwIfAborted(signal);
    this.identifiers = identifiers;
    this.preparedBlocks = prepared;
    this.nameProjections = names;
    this.addressProjections = addresses;
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

    const scoring = prepareScoringQuery(validation);
    const eligible: number[] = [];
    const similar: number[] = [];
    // Lossless projection retrieval: score only rows that can satisfy the oracle's
    // name, literal-address, address-match or broad-relevance acceptance predicate.
    // Every ordinal is still visited; no posting cutoff or result cap is applied.
    const names = new Uint8Array(this.nameProjections.length);
    const addresses = new Uint8Array(this.addressProjections.length);
    const possibleName = (reference: number) => {
      if (!names[reference]) {
        const key = this.nameProjections[reference] as string;
        names[reference] =
          matchName(scoring.query.nameKey, key) !== 'none' ||
          matchName(scoring.validation.nameKey, key) !== 'none'
            ? 2
            : 1;
      }
      return names[reference] === 2;
    };
    const possibleAddress = (reference: number) => {
      if (!addresses[reference]) {
        const address = this.addressProjections[reference] as AddressProjection;
        if (scoring.query.address) {
          const comparison = compareSearchAddress(scoring.query.address, address.parts);
          addresses[reference] = comparison.relevant || comparison.match !== 'none' ? 2 : 1;
        } else
          addresses[reference] = matchesLiteralAddress(address.tokens, scoring.literalTokens)
            ? 2
            : 1;
      }
      return addresses[reference] === 2;
    };
    const scores = new Int16Array(this.recordCount);
    const conflicts = new Uint8Array(this.recordCount);
    let scanned = 0;
    for (const block of blocks) {
      for (let row = 0; row < block.block.count; row++) {
        const ordinal = block.block.start + row;
        const possible =
          possibleName(block.nameRefs[row] as number) ||
          possibleAddress(block.roadRefs[row] as number) ||
          possibleAddress(block.parcelRefs[row] as number);
        const scored = possible ? this.score(block, row, scoring) : null;
        if (scored) {
          scores[ordinal] = scored.score;
          conflicts[ordinal] = Number(hasConflict(scored));
          if (scored.confidence === 'low') similar.push(ordinal);
          else eligible.push(ordinal);
        }
        if (++scanned >= SEARCH_BATCH) {
          scanned = 0;
          await cooperativeYield(signal);
        }
      }
    }

    const eligibleOrdinals = await sortOrdinals(
      eligible,
      (left, right) =>
        compareCandidateRank(
          scores[left] as number,
          this.idAt(left),
          scores[right] as number,
          this.idAt(right),
        ),
      signal,
    );
    const similarOrdinals = await sortOrdinals(
      similar,
      (left, right) =>
        compareSimilarCandidateRank(
          Boolean(conflicts[left]),
          scores[left] as number,
          this.idAt(left),
          Boolean(conflicts[right]),
          scores[right] as number,
          this.idAt(right),
        ),
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
    const road = this.addressProjections[block.roadRefs[row] as number] as AddressProjection;
    const parcel = this.addressProjections[block.parcelRefs[row] as number] as AddressProjection;
    const entry: ScoringEntry = {
      nameKey: this.nameProjections[block.nameRefs[row] as number] as string,
      addresses: [road.parts, parcel.parts],
      addressTokens: [road.tokens, parcel.tokens],
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

  private idAt(ordinal: number): string {
    return this.identifiers[ordinal] as string;
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
