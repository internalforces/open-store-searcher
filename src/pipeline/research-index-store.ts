import { createHash, type Hash } from 'node:crypto';
import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import { dirname, isAbsolute, join, relative } from 'node:path';
import { TextDecoder } from '@exodus/bytes/encoding.js';
import { ObservationAccumulationError } from './research-metrics-accumulator.js';

export type ResearchIndex = ['i', string, string, number, number] | ['c', string, number, number];
export const RESEARCH_STORAGE_LIMITS = Object.freeze({
  maxScratchBytes: 4_294_967_296,
  maxPartitionBytes: 67_108_864,
  maxPendingBytes: 16_777_216,
  maxLineBytes: 2_097_152,
  maxPartitionKeys: 250_000,
  maxKeyBytes: 33_554_432,
  maxPairBytes: 33_554_432,
  maxPairs: 100_000,
  maxHeapBytes: 1_610_612_736,
  freeSpaceHeadroom: 536_870_912,
});
type Limits = { [K in keyof typeof RESEARCH_STORAGE_LIMITS]: number };
const BUFFER_BYTES = 65_536;
export function indexPartition(record: ResearchIndex): number {
  return createHash('sha256').update(record[1], 'utf8').digest()[0] as number;
}
function canonicalBase64(value: unknown, bytes?: number): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    Buffer.from(value, 'base64').toString('base64') === value &&
    (bytes === undefined || Buffer.from(value, 'base64').length === bytes)
  );
}
function validIndex(value: unknown): value is ResearchIndex {
  if (!Array.isArray(value)) return false;
  const identity = value[0] === 'i';
  if (
    identity
      ? value.length !== 5 || !canonicalBase64(value[1], 32) || !canonicalBase64(value[2])
      : value[0] !== 'c' || value.length !== 4 || typeof value[1] !== 'string'
  )
    return false;
  if (!identity) {
    let key: unknown;
    try {
      key = JSON.parse(value[1]);
    } catch {
      return false;
    }
    if (
      !Array.isArray(key) ||
      key.length !== 2 ||
      !['businessName', 'roadAddress', 'parcelAddress', 'businessNameAndAddress'].includes(
        key[0],
      ) ||
      typeof key[1] !== 'string' ||
      JSON.stringify(key) !== value[1]
    )
      return false;
  }
  return (
    Number.isSafeInteger(value[identity ? 3 : 2]) &&
    value[identity ? 3 : 2] >= 0 &&
    Number.isSafeInteger(value[identity ? 4 : 3]) &&
    value[identity ? 4 : 3] >= 0 &&
    value[identity ? 4 : 3] < 256
  );
}
type Partition = {
  bytes: number;
  count: number;
  hash: Hash;
  buffered: Buffer[];
  pending: number;
  created: boolean;
};

/** Private, bounded scratch storage. It cannot emit records to a report or publish data. */
export class ResearchIndexStore {
  private readonly directory: string;
  private readonly parent: string;
  private readonly device: number;
  private readonly inode: number;
  private readonly checkBudget: () => void;
  readonly limits: Limits;
  private readonly files = new Map<number, Partition>();
  private totalBytes = 0;
  private indexCount = 0;
  private largestPartition = 0;
  private peakBufferedBytes = 0;
  private pendingBytes = 0;
  private failed = false;
  private sealed = false;
  private cleaned = false;

  private constructor(
    directory: string,
    parent: string,
    device: number,
    inode: number,
    checkBudget: () => void,
    limits: Limits,
  ) {
    this.directory = directory;
    this.parent = parent;
    this.device = device;
    this.inode = inode;
    this.checkBudget = checkBudget;
    this.limits = limits;
  }
  static async create(
    staging: string,
    repository: string,
    checkBudget: () => void,
    overrides: Partial<Record<keyof Limits, number>> = {},
  ): Promise<ResearchIndexStore> {
    const limits = { ...RESEARCH_STORAGE_LIMITS, ...overrides };
    for (const key of Object.keys(limits) as (keyof Limits)[]) {
      if (
        !Number.isSafeInteger(limits[key]) ||
        limits[key] <= 0 ||
        limits[key] > RESEARCH_STORAGE_LIMITS[key]
      )
        throw new ObservationAccumulationError('observation_index_limit_exceeded');
    }
    const parent = await fs.realpath(staging);
    const root = await fs.realpath(repository);
    const rel = relative(root, parent);
    if (!isAbsolute(staging) || !(rel === '..' || rel.startsWith('../') || isAbsolute(rel)))
      throw new ObservationAccumulationError('observation_storage_path_invalid');
    checkBudget();
    const directory = await fs.mkdtemp(join(parent, 'observation-index-'));
    const stat = await fs.lstat(directory);
    return new ResearchIndexStore(directory, parent, stat.dev, stat.ino, checkBudget, limits);
  }
  private active(): void {
    if (this.failed || this.cleaned)
      throw new ObservationAccumulationError('observation_storage_invalid');
    this.checkBudget();
  }
  private path(id: number): string {
    return join(this.directory, `${id.toString(16).padStart(2, '0')}.jsonl`);
  }
  private async space(additional: number): Promise<void> {
    const stat = await fs.statfs(this.directory, { bigint: true });
    const available = stat.bavail * stat.bsize;
    if (
      stat.bavail < 0n ||
      stat.bsize <= 0n ||
      available < BigInt(this.limits.freeSpaceHeadroom + this.pendingBytes + additional)
    )
      throw new ObservationAccumulationError('observation_storage_space_exceeded');
  }
  private fail(error: unknown): never {
    this.failed = true;
    if (error instanceof ObservationAccumulationError) throw error;
    throw new ObservationAccumulationError('observation_storage_failed');
  }
  async appendBatch(records: readonly ResearchIndex[]): Promise<void> {
    try {
      this.active();
      if (this.sealed) throw new ObservationAccumulationError('observation_storage_invalid');
      const lines: { id: number; data: Buffer }[] = [];
      const additions = new Map<number, number>();
      let bytes = 0;
      for (const record of records) {
        this.checkBudget();
        if (!validIndex(record))
          throw new ObservationAccumulationError('observation_storage_invalid');
        const line = `${JSON.stringify(record)}\n`;
        const length = Buffer.byteLength(line, 'utf8');
        const id = indexPartition(record);
        const addition = (additions.get(id) ?? 0) + length;
        if (
          length > this.limits.maxLineBytes ||
          length > this.limits.maxPendingBytes - bytes ||
          length > this.limits.maxScratchBytes - this.totalBytes - bytes ||
          addition > this.limits.maxPartitionBytes - (this.files.get(id)?.bytes ?? 0)
        )
          throw new ObservationAccumulationError('observation_index_limit_exceeded');
        if (length > this.limits.maxPendingBytes - this.pendingBytes - bytes) await this.flush();
        bytes += length;
        additions.set(id, addition);
        lines.push({ id, data: Buffer.from(line, 'utf8') });
      }
      await this.space(bytes);
      for (const { id, data } of lines) {
        let file = this.files.get(id);
        if (!file) {
          file = {
            bytes: 0,
            count: 0,
            hash: createHash('sha256'),
            buffered: [],
            pending: 0,
            created: false,
          };
          this.files.set(id, file);
        }
        file.bytes += data.length;
        file.count++;
        file.hash.update(data);
        file.buffered.push(data);
        file.pending += data.length;
        this.totalBytes += data.length;
        this.indexCount++;
        this.largestPartition = Math.max(this.largestPartition, file.bytes);
        this.pendingBytes += data.length;
        this.peakBufferedBytes = Math.max(this.peakBufferedBytes, this.pendingBytes);
        if (file.pending >= BUFFER_BYTES) await this.flushPartition(id, file);
        this.checkBudget();
      }
    } catch (error) {
      this.fail(error);
    }
  }
  private async flushPartition(id: number, file: Partition): Promise<void> {
    if (!file.pending) return;
    this.active();
    await this.space(0);
    await fs.appendFile(this.path(id), Buffer.concat(file.buffered, file.pending), {
      flag:
        constants.O_WRONLY |
        constants.O_APPEND |
        constants.O_CREAT |
        constants.O_NOFOLLOW |
        (file.created ? 0 : constants.O_EXCL),
      mode: 0o600,
    });
    file.created = true;
    this.pendingBytes -= file.pending;
    file.pending = 0;
    file.buffered = [];
    this.checkBudget();
  }
  async flush(): Promise<void> {
    try {
      this.active();
      for (const [id, file] of this.files) await this.flushPartition(id, file);
    } catch (error) {
      this.fail(error);
    }
  }
  async *partitions(): AsyncGenerator<{ id: number; records: AsyncIterable<ResearchIndex> }> {
    try {
      this.active();
      if (this.sealed) throw new ObservationAccumulationError('observation_storage_invalid');
      await this.flush();
      this.sealed = true;
      for (let id = 0; id < 256; id++) {
        const file = this.files.get(id);
        if (file) yield { id, records: this.readPartition(id, file) };
      }
    } catch (error) {
      this.fail(error);
    }
  }
  private async *readPartition(id: number, expected: Partition): AsyncGenerator<ResearchIndex> {
    let handle: fs.FileHandle | undefined;
    try {
      this.active();
      try {
        handle = await fs.open(this.path(id), constants.O_RDONLY | constants.O_NOFOLLOW);
      } catch {
        throw new ObservationAccumulationError('observation_storage_invalid');
      }
      const hash = createHash('sha256');
      let bytes = 0;
      let count = 0;
      let pending = Buffer.alloc(0);
      const decoder = new TextDecoder('utf-8', { fatal: true });
      for await (const chunk of handle.createReadStream({
        highWaterMark: BUFFER_BYTES,
        autoClose: false,
      })) {
        this.active();
        const buffer = chunk as Buffer;
        bytes += buffer.length;
        if (bytes > expected.bytes)
          throw new ObservationAccumulationError('observation_storage_invalid');
        hash.update(buffer);
        pending = Buffer.concat([pending, buffer]);
        while (pending.includes(10)) {
          const end = pending.indexOf(10);
          if (end + 1 > this.limits.maxLineBytes)
            throw new ObservationAccumulationError('observation_storage_invalid');
          let value: unknown;
          let line: string;
          try {
            line = decoder.decode(pending.subarray(0, end));
            value = JSON.parse(line);
          } catch {
            throw new ObservationAccumulationError('observation_storage_invalid');
          }
          if (!validIndex(value) || JSON.stringify(value) !== line || indexPartition(value) !== id)
            throw new ObservationAccumulationError('observation_storage_invalid');
          pending = pending.subarray(end + 1);
          count++;
          this.checkBudget();
          yield value;
        }
        if (pending.length >= this.limits.maxLineBytes)
          throw new ObservationAccumulationError('observation_storage_invalid');
      }
      if (
        pending.length ||
        bytes !== expected.bytes ||
        count !== expected.count ||
        hash.digest('hex') !== expected.hash.digest('hex')
      )
        throw new ObservationAccumulationError('observation_storage_invalid');
    } catch (error) {
      this.fail(error);
    } finally {
      await handle?.close();
    }
  }
  get statistics() {
    return {
      serializedBytes: this.totalBytes,
      indexCount: this.indexCount,
      largestPartitionBytes: this.largestPartition,
      peakBufferedBytes: this.peakBufferedBytes,
    };
  }
  async cleanup(): Promise<void> {
    if (this.cleaned) return;
    try {
      const stat = await fs.lstat(this.directory);
      if (
        stat.isSymbolicLink() ||
        !stat.isDirectory() ||
        stat.dev !== this.device ||
        stat.ino !== this.inode ||
        (await fs.realpath(this.directory)) !== this.directory ||
        dirname(this.directory) !== this.parent ||
        (await fs.realpath(this.parent)) !== this.parent
      )
        throw new Error('unsafe cleanup');
      await fs.rm(this.directory, { recursive: true });
      this.cleaned = true;
      this.files.clear();
    } catch {
      this.failed = true;
      throw new ObservationAccumulationError('observation_cleanup_failed');
    }
  }
}
