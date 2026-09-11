import { createHash } from 'node:crypto';
import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { indexPartition, type ResearchIndex, ResearchIndexStore } from './research-index-store.js';

vi.mock('node:fs/promises', async (original) => ({ ...(await original<typeof fs>()) }));
const roots: string[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const root of roots.splice(0)) await fs.rm(root, { recursive: true, force: true });
});
async function fixture(limits = {}) {
  const root = await fs.mkdtemp(join(tmpdir(), 'oss-index-test-'));
  roots.push(root);
  const store = await ResearchIndexStore.create(root, process.cwd(), () => {}, limits);
  const directory = join(root, (await fs.readdir(root))[0] as string);
  return { root, directory, store };
}
function identity(tuple = 'tuple', ordinal = 0): ResearchIndex {
  return [
    'i',
    createHash('sha256').update('same-digest').digest('base64'),
    Buffer.from(tuple).toString('base64'),
    ordinal,
    0,
  ];
}
async function all(store: ResearchIndexStore) {
  const result: ResearchIndex[] = [];
  for await (const partition of store.partitions())
    for await (const record of partition.records) result.push(record);
  return result;
}
describe('private research index partitions', () => {
  test('round trips canonical escaped Unicode indexes with digest-only identity placement', async () => {
    const { root, directory, store } = await fixture();
    const records: ResearchIndex[] = [
      identity('first'),
      identity('second', 1),
      ['c', JSON.stringify(['businessName', '한글\n"\\']), 1, 0],
    ];
    expect(indexPartition(records[0] as ResearchIndex)).toBe(
      indexPartition(records[1] as ResearchIndex),
    );
    await store.appendBatch(records);
    expect((await all(store)).sort()).toEqual([...records].sort());
    expect((await fs.stat(directory)).mode & 0o777).toBe(0o700);
    for (const file of await fs.readdir(directory))
      expect((await fs.stat(join(directory, file))).mode & 0o777).toBe(0o600);
    await store.cleanup();
    await store.cleanup();
    expect(await fs.readdir(root)).toEqual([]);
  });
  test.each(['maxScratchBytes', 'maxPartitionBytes', 'maxPendingBytes', 'maxLineBytes'] as const)(
    'rejects %s before writing an oversized batch',
    async (key) => {
      const { directory, store } = await fixture({ [key]: 8 });
      await expect(store.appendBatch([identity()])).rejects.toThrow(
        'observation_index_limit_exceeded',
      );
      expect(await fs.readdir(directory)).toEqual([]);
      await expect(all(store)).rejects.toThrow();
      await store.cleanup();
    },
  );
  test.each(['truncated', 'altered', 'missing', 'extra'] as const)(
    'rejects %s partition evidence',
    async (kind) => {
      const { directory, store } = await fixture();
      await store.appendBatch([identity()]);
      await store.flush();
      const path = join(directory, (await fs.readdir(directory))[0] as string);
      const text = await fs.readFile(path, 'utf8');
      if (kind === 'missing') await fs.unlink(path);
      else
        await fs.writeFile(
          path,
          kind === 'truncated'
            ? text.slice(0, -1)
            : kind === 'extra'
              ? `${text}${text}`
              : text.replace('dHVwbGU=', 'b3RoZXI='),
        );
      await expect(all(store)).rejects.toThrow('observation_storage_invalid');
      await store.cleanup();
    },
  );
  test('rejects unavailable or insufficient free space before buffering source indexes', async () => {
    const { store } = await fixture();
    vi.spyOn(fs, 'statfs').mockRejectedValueOnce(new Error('private-path'));
    await expect(store.appendBatch([identity()])).rejects.toThrow('observation_storage_failed');
    await store.cleanup();
    const next = await fixture();
    vi.spyOn(fs, 'statfs').mockResolvedValue({ bavail: 0n, bsize: 4096n } as Awaited<
      ReturnType<typeof fs.statfs>
    >);
    await expect(next.store.appendBatch([identity()])).rejects.toThrow(
      'observation_storage_space_exceeded',
    );
    await next.store.cleanup();
  });
  test('rejects write failure and remains cleanup-safe', async () => {
    const { store } = await fixture();
    await store.appendBatch([identity()]);
    vi.spyOn(fs, 'appendFile').mockRejectedValueOnce(new Error('private-content'));
    await expect(store.flush()).rejects.toThrow('observation_storage_failed');
    await store.cleanup();
  });
  test('refuses repository and symlink-resolved repository staging', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), 'oss-index-test-'));
    roots.push(root);
    await fs.symlink(process.cwd(), join(root, 'link'));
    for (const path of [process.cwd(), join(root, 'link')])
      await expect(ResearchIndexStore.create(path, process.cwd(), () => {})).rejects.toThrow(
        'observation_storage_path_invalid',
      );
  });
  test('refuses cleanup of a substituted symlink and never removes its target', async () => {
    const { root, directory, store } = await fixture();
    const moved = `${directory}-original`;
    await fs.rename(directory, moved);
    const target = join(root, 'target');
    await fs.mkdir(target);
    await fs.writeFile(join(target, 'keep'), 'keep');
    await fs.symlink(target, directory);
    await expect(store.cleanup()).rejects.toThrow('observation_cleanup_failed');
    expect(await fs.readFile(join(target, 'keep'), 'utf8')).toBe('keep');
    await fs.unlink(directory);
    await fs.rename(moved, directory);
    await store.cleanup();
  });
  test('accepts byte ceilings exactly and rejects the next reservation', async () => {
    const record = identity();
    const bytes = Buffer.byteLength(JSON.stringify(record)) + 1;
    const { store } = await fixture({
      maxScratchBytes: bytes,
      maxPartitionBytes: bytes,
      maxPendingBytes: bytes,
      maxLineBytes: bytes,
    });
    await store.appendBatch([record]);
    await expect(store.appendBatch([identity('second', 1)])).rejects.toThrow(
      'observation_index_limit_exceeded',
    );
    await store.cleanup();
    const exact = await fixture({
      maxScratchBytes: bytes,
      maxPartitionBytes: bytes,
      maxPendingBytes: bytes,
      maxLineBytes: bytes,
    });
    await exact.store.appendBatch([record]);
    expect(await all(exact.store)).toEqual([record]);
    await exact.store.cleanup();
  });
  test.each([
    [],
    ['unknown', 'key', 0, 0],
    ['i', 'invalid', 'dHVwbGU=', 0, 0],
    ['i', `${'A'.repeat(43)}=`, 'invalid!', 0, 0],
    ['c', 'not-json', 0, 0],
    ['c', '["unknown","value"]', 0, 0],
    ['c', '["businessName",null]', 0, 0],
    ['c', '[ "businessName", "value" ]', 0, 0],
    ['c', '["businessName","value"]', -1, 0],
    ['c', '["businessName","value"]', 0, 256],
  ])('rejects malformed canonical index %j before storing it', async (...fields) => {
    const { store, directory } = await fixture();
    await expect(store.appendBatch([fields as unknown as ResearchIndex])).rejects.toThrow(
      'observation_storage_invalid',
    );
    expect(await fs.readdir(directory)).toEqual([]);
    await store.cleanup();
  });
  test('rejects invalid UTF-8 and malformed JSON while replaying a partition', async () => {
    for (const data of [Buffer.from([255, 10]), Buffer.from('{broken}\n')]) {
      const { directory, store } = await fixture();
      await store.appendBatch([identity()]);
      await store.flush();
      await fs.writeFile(join(directory, (await fs.readdir(directory))[0] as string), data);
      await expect(all(store)).rejects.toThrow('observation_storage_invalid');
      await store.cleanup();
    }
  });
  test('checks the budget during replay and still permits cleanup after cancellation', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), 'oss-index-test-'));
    roots.push(root);
    let cancelled = false;
    const store = await ResearchIndexStore.create(root, process.cwd(), () => {
      if (cancelled) throw new Error('cancelled');
    });
    await store.appendBatch([identity()]);
    await store.flush();
    cancelled = true;
    await expect(all(store)).rejects.toThrow('observation_storage_failed');
    await store.cleanup();
    expect(await fs.readdir(root)).toEqual([]);
  });
  test('rejects cleanup I/O failure and allows a guarded retry', async () => {
    const { root, store } = await fixture();
    vi.spyOn(fs, 'rm').mockRejectedValueOnce(new Error('private-path'));
    await expect(store.cleanup()).rejects.toThrow('observation_cleanup_failed');
    expect(await fs.readdir(root)).toHaveLength(1);
    await store.cleanup();
    expect(await fs.readdir(root)).toEqual([]);
  });
  test('refuses appending after replay or after cleanup', async () => {
    const { store } = await fixture();
    await store.appendBatch([identity()]);
    await all(store);
    await expect(store.appendBatch([identity()])).rejects.toThrow('observation_storage_invalid');
    await store.cleanup();
    await expect(store.appendBatch([identity()])).rejects.toThrow('observation_storage_invalid');
  });
  test('keeps all retained pending bytes within the cap across consecutive unflushed batches', async () => {
    const records: ResearchIndex[] = [0, 1, 2].map((i) => [
      'c',
      JSON.stringify(['businessName', `distinct-${i}`]),
      i,
      0,
    ]);
    expect(new Set(records.map(indexPartition)).size).toBe(3);
    const bytes = records
      .slice(0, 2)
      .reduce((sum, record) => sum + Buffer.byteLength(JSON.stringify(record)) + 1, 0);
    const { store } = await fixture({ maxPendingBytes: bytes });
    for (const record of records) await store.appendBatch([record]);
    expect(store.statistics.peakBufferedBytes).toBeLessThanOrEqual(bytes);
    expect((await all(store)).sort()).toEqual([...records].sort());
    await store.cleanup();
  });
});
