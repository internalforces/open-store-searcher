import type { DisplayDataset, DisplayRecord } from './display-data.js';

// Entirely invented UI fixtures, never collected records or production status evidence.
function example(
  id: string,
  name: string,
  roadAddress: string,
  operatingCode: string,
  operatingName: string,
): DisplayRecord {
  return {
    id,
    name,
    roadAddress,
    parcelAddress: '',
    categoryName: '합성 예시 업종',
    businessTypes: [{ sourceField: '업태구분명', value: '합성 예시 업태' }],
    rawStatus: { operatingCode, operatingName, detailedCode: null, detailedName: null },
    lifecycle: {
      licensedOn: '2020-01-02',
      licenseCancelledOn: null,
      suspendedFrom: operatingCode === '02' ? '2026-08-01' : null,
      suspendedThrough: null,
      reopenedOn: null,
      closedOn: operatingCode === '03' ? '2026-08-15' : null,
      sourceUpdatedAt: '2026-09-01 09:00:00',
      sourceLastModifiedAt: null,
    },
    sourceLabel: '프로젝트에서 만든 합성 예시 (공공데이터 원본 아님)',
    sourceUrl: null,
  };
}

export const demoDataset: DisplayDataset = {
  sourceLabel: '프로젝트에서 만든 합성 예시 (공공데이터 원본 아님)',
  sourceUrl: null,
  coverage: { kind: 'synthetic', date: '2026-09-01' },
  exampleQuery: '가상별빛 카페 서울특별시 마포구 월드컵로 12-1',
  records: [
    example(
      'demo-operating',
      '가상별빛 카페',
      '서울특별시 마포구 월드컵로 12-1',
      '01',
      '영업/정상',
    ),
    example('demo-conflict', '가상별빛 카페', '서울특별시 강남구 테헤란로 12-1', '02', '휴업'),
    example('demo-closed', '가상노을 식당', '서울특별시 송파구 올림픽로 10', '03', '폐업'),
    example(
      'demo-unknown',
      '가상달빛 가게',
      '서울특별시 중구 세종대로 30',
      '99',
      '예시 미등록 상태',
    ),
    example('demo-tie-a', '가상동률 식당', '서울특별시 종로구 자하문로 20', '01', '영업/정상'),
    example('demo-tie-b', '가상동률 식당', '서울특별시 종로구 자하문로 20', '03', '폐업'),
  ],
};
