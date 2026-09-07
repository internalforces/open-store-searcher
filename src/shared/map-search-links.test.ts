import { describe, expect, it } from 'vitest';
import { createMapSearchLinks } from './map-search-links.js';

// TASK-016 invented record terms; update only when the approved map-link behavior changes.
const record = { name: '가상 카페', roadAddress: '서울 길 1', parcelAddress: '서울 동 2' };

describe('createMapSearchLinks', () => {
  it('encodes record name and preferred road address into exact provider URLs', () => {
    expect(
      createMapSearchLinks({ name: 'A & B', roadAddress: 'Road/1 #2', parcelAddress: 'unused' }),
    ).toEqual({
      naver: 'https://map.naver.com/p/search/A%20%26%20B%20Road%2F1%20%232',
      kakao: 'https://map.kakao.com/link/search/A%20%26%20B%20Road%2F1%20%232',
    });
  });
  it.each([
    [{ ...record, roadAddress: ' \t ' }, '가상 카페 서울 동 2'],
    [{ ...record, roadAddress: null }, '가상 카페 서울 동 2'],
    [{ ...record, name: ' ', parcelAddress: null }, '서울 길 1'],
    [{ name: ' 가상 카페 ', roadAddress: null, parcelAddress: '' }, '가상 카페'],
    [{ name: '', roadAddress: null, parcelAddress: ' 서울 동 2 ' }, '서울 동 2'],
  ])(
    'uses available record fields without substituting display placeholders: %j',
    (input, terms) => {
      const links = createMapSearchLinks(input);
      expect(links).not.toBeNull();
      for (const href of Object.values(links ?? {})) {
        expect(decodeURIComponent(new URL(href).pathname.split('/').at(-1) ?? '')).toBe(terms);
      }
    },
  );
  it.each([
    '한글 😀 e\u0301',
    'a/b?x=1&y=2#z%20+q',
    'https://evil.invalid/../x',
    '<img src=x onerror=alert(1)>',
    "!'()*",
    '..',
  ])('keeps Unicode and hostile terms inside one encoded path segment: %s', (name) => {
    const links = createMapSearchLinks({ ...record, name });
    expect(links).not.toBeNull();
    for (const [provider, href] of Object.entries(links ?? {})) {
      const url = new URL(href);
      expect(url.origin).toBe(
        provider === 'naver' ? 'https://map.naver.com' : 'https://map.kakao.com',
      );
      expect(url.search).toBe('');
      expect(url.hash).toBe('');
      expect(url.username).toBe('');
      expect(url.pathname.split('/')).toHaveLength(4);
      expect(decodeURIComponent(url.pathname.split('/').at(-1) ?? '')).toBe(`${name} 서울 길 1`);
    }
  });
  it.each(['', ' \n\t ', '.', '..', '\ud800', '\udc00'])(
    'omits empty, path-dot or malformed Unicode terms without throwing: %j',
    (name) => {
      expect(createMapSearchLinks({ name, roadAddress: null, parcelAddress: null })).toBeNull();
    },
  );
});
