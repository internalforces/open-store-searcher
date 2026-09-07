import { describe, expect, it } from 'vitest';
import { demoDataset } from './demo-data.js';
import { prepareDisplayData } from './prepare-display-data.js';

describe('prepareDisplayData', () => {
  it('keeps unknown raw status and missing name without inventing evidence', () => {
    const result = prepareDisplayData({
      ...demoDataset,
      records: [{ ...demoDataset.records[3], name: '' }],
    });
    expect(result.dataset.records[0]?.rawStatus.operatingCode).toBe('99');
    expect(result.dataset.records[0]?.name).toBe('');
    expect(result.excludedCount).toBe(0);
  });
  it('excludes every duplicate identity including a malformed peer', () => {
    const result = prepareDisplayData({
      ...demoDataset,
      records: [
        demoDataset.records[0],
        { ...demoDataset.records[0], lifecycle: null },
        demoDataset.records[3],
      ],
    });
    expect(result.dataset.records.map((record) => record.id)).toEqual(['demo-unknown']);
    expect(result.excludedCount).toBe(2);
  });
  it.each([
    null,
    { id: 'malformed' },
    { ...demoDataset.records[0], rawStatus: null },
    { ...demoDataset.records[0], rawStatus: { operatingCode: 1 } },
    { ...demoDataset.records[0], businessTypes: [null] },
    { ...demoDataset.records[0], businessTypes: [{ sourceField: '업태', value: {} }] },
    { ...demoDataset.records[0], sourceLabel: null },
    { ...demoDataset.records[0], sourceUrl: {} },
    { ...demoDataset.records[0], lifecycle: {} },
    { ...demoDataset.records[0], categoryName: {} },
  ])('excludes malformed record %j without crashing valid search', (invalid) => {
    const result = prepareDisplayData({
      ...demoDataset,
      records: [invalid, demoDataset.records[3]],
    });
    expect(result.dataset.records.map((record) => record.id)).toEqual(['demo-unknown']);
    expect(result.excludedCount).toBe(1);
  });
  it.each([
    null,
    [],
    {},
    { ...demoDataset, records: null },
    { ...demoDataset, coverage: { kind: 'invented' } },
    { ...demoDataset, sourceLabel: '' },
    { ...demoDataset, records: [null] },
  ])('rejects unusable dataset %j', (value) => {
    expect(() => prepareDisplayData(value)).toThrow();
  });
  it('accepts an explicitly empty dataset and keeps unknown coverage', () => {
    const result = prepareDisplayData({
      ...demoDataset,
      records: [],
      coverage: { kind: 'unavailable' },
    });
    expect(result.dataset.records).toEqual([]);
    expect(result.dataset.coverage).toEqual({ kind: 'unavailable' });
  });
});
