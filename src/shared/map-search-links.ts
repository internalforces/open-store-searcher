/** Record-only external search destinations; never accept the user's submitted query. */
export function createMapSearchLinks(record: {
  readonly name: string;
  readonly roadAddress: string | null;
  readonly parcelAddress: string | null;
}): { readonly naver: string; readonly kakao: string } | null {
  const address = record.roadAddress?.trim() || record.parcelAddress?.trim() || '';
  const terms = [record.name.trim(), address].filter(Boolean).join(' ');
  // URL parsers normalize dot segments even when percent-encoded. Invalid UTF-16 must not
  // crash a result card or silently search for a replacement-character business name.
  if (!terms || terms === '.' || terms === '..') return null;
  let encoded: string;
  try {
    encoded = encodeURIComponent(terms).replace(
      /[!'()*]/gu,
      (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
    );
  } catch {
    return null;
  }
  return {
    // User accepted this web-route compatibility limitation; it is not a documented API.
    naver: `https://map.naver.com/p/search/${encoded}`,
    kakao: `https://map.kakao.com/link/search/${encoded}`,
  };
}
