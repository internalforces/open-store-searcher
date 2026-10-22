// TASK-016 invented browser fixture for source-mode links and offline navigation interception.
// Coverage is deliberately unavailable; this fixture establishes no production source evidence.
// Consumed only by map-browser.ts; update when App's internal display contract changes.
import { render } from 'preact';
import { App } from '../../src/app/app.js';
import { demoDataset } from '../../src/app/demo-data.js';

export function mount(longEvidence = false) {
  const root = document.createElement('div');
  document.body.replaceChildren(root);
  render(
    <App
      dataset={{
        ...demoDataset,
        coverage: { kind: 'unavailable' },
        records: demoDataset.records.map((record) => ({
          ...record,
          sourceLabel: longEvidence
            ? `https://www.data.go.kr/${'긴출처'.repeat(50)}`
            : '시험 원본 출처',
          sourceUrl: `https://www.data.go.kr/data/15045011/fileData.do${longEvidence ? `?evidence=${'LONG'.repeat(60)}` : ''}`,
          ...(longEvidence
            ? {
                categoryName: '긴업종'.repeat(30),
                businessTypes: [
                  { sourceField: '업태구분명', value: '긴업태'.repeat(40) },
                  { sourceField: '업태구분명', value: '반복업태'.repeat(40) },
                ],
                rawStatus: { ...record.rawStatus, detailedName: '긴원본상태'.repeat(40) },
              }
            : {}),
        })),
      }}
    />,
    root,
  );
}
