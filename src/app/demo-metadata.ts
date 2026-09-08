import type { DisplayDataset } from './display-data.js';

export const demoMetadata: Omit<DisplayDataset, 'records'> = {
  sourceLabel: '프로젝트에서 만든 합성 예시 (공공데이터 원본 아님)',
  sourceUrl: null,
  coverage: {
    kind: 'synthetic',
    date: '2026-09-01',
  },
  exampleQuery: '가상별빛 카페 서울특별시 마포구 월드컵로 12-1',
};
