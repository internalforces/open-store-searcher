/** Search-only baseline compatible with TASK-006 V1; never use for display or identity. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\p{White_Space}+/gu, ' ')
    .replace(/^ | $/g, '');
}

const ENTITIES: Readonly<Record<string, string>> = Object.freeze({
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
});

/** Decode one pass of common, semicolon-terminated notation without parsing HTML. */
function decodeNotation(value: string): string {
  return value.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#\d{1,7}|#x[\da-fA-F]{1,6});/gi, (entity) => {
    const body = entity.slice(1, -1).toLowerCase();
    if (!body.startsWith('#')) return ENTITIES[body] ?? entity;
    const point = body.startsWith('#x')
      ? Number.parseInt(body.slice(2), 16)
      : Number.parseInt(body.slice(1), 10);
    if (point === 0 || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff)) return entity;
    return String.fromCodePoint(point);
  });
}

export interface SearchTextProjection {
  normalized: string;
  nameKey: string;
  addressKey: string;
  addressTokens: string[];
}

/** Project query or candidate fields identically, including empty and single-character fields. */
export function projectSearchText(value: string): SearchTextProjection {
  const normalized = normalizeSearchText(decodeNotation(value));
  const nameKey = normalizeSearchText(normalized.replace(/\p{P}+/gu, ' '));
  // Canonicalize dash punctuation to a hyphen without erasing number separators.
  const addressKey = normalizeSearchText(
    normalized
      .replace(/\p{Pd}/gu, '-')
      .replace(/\p{P}/gu, (character) => (character === '-' ? character : ' '))
      .replace(/(\p{L})(\d)/gu, '$1 $2')
      .replace(/(\d)(\p{L})/gu, '$1 $2'),
  );
  return {
    normalized,
    nameKey,
    addressKey,
    addressTokens: addressKey ? addressKey.split(' ') : [],
  };
}

export type PreparedSearchQuery =
  | { ok: false; original: string; reason: 'empty' | 'too_short'; message: string }
  | ({ ok: true; original: string } & SearchTextProjection);

/**
 * Prepare one input for both name and address comparison; do not guess which words are a name.
 * Consumers must use projectSearchText for candidate fields, render strings as text, and keep
 * values in transient memory. No ranking, record merging, persistence, logging, or I/O occurs here.
 */
export function prepareSearchQuery(original: string): PreparedSearchQuery {
  const projection = projectSearchText(original);
  const characters = [
    ...new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(
      projection.nameKey.replace(/ /g, ''),
    ),
  ].length;
  if (characters < 2) {
    return {
      ok: false,
      original,
      reason: characters === 0 ? 'empty' : 'too_short',
      message:
        characters === 0
          ? '상호명 또는 주소를 입력해 주세요.'
          : '검색어를 두 글자 이상 입력해 주세요.',
    };
  }
  return { ok: true, original, ...projection };
}
