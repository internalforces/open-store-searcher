import { createMapSearchLinks } from '../shared/map-search-links.js';
import type { DisplayRecord } from './display-data.js';

export function MapLinks({ record, synthetic }: { record: DisplayRecord; synthetic: boolean }) {
  if (synthetic) {
    return <p className="disclaimer">합성 예시 데이터에는 외부 지도 검색을 제공하지 않습니다.</p>;
  }
  const links = createMapSearchLinks(record);
  if (!links) {
    return <p className="disclaimer">지도 검색에 사용할 상호명 또는 주소 정보가 없습니다.</p>;
  }
  return (
    <div className="map-search">
      <p>
        선택하면 이 후보의 상호명·주소가 외부 지도에 전달됩니다. 같은 사업체인지 직접 확인하세요.
      </p>
      <div className="map-actions">
        <a
          href={links.naver}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
        >
          네이버 지도에서 검색 (새 탭)
        </a>
        <a
          href={links.kakao}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
        >
          카카오맵에서 검색 (새 탭)
        </a>
      </div>
    </div>
  );
}
