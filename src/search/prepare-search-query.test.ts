import { describe, expect, test } from 'vitest';
import {
  normalizeSearchText,
  prepareSearchQuery,
  projectSearchText,
} from './prepare-search-query.js';

describe('TASK-011 query preparation', () => {
  test('projects short candidate fields without applying query minimum length', () => {
    expect(projectSearchText('봄')).toEqual({
      normalized: '봄',
      nameKey: '봄',
      addressKey: '봄',
      addressTokens: ['봄'],
    });
    expect(projectSearchText('')).toEqual({
      normalized: '',
      nameKey: '',
      addressKey: '',
      addressTokens: [],
    });
    expect(prepareSearchQuery('봄')).toMatchObject({ ok: false, reason: 'too_short' });
    expect(prepareSearchQuery('봄 카페')).toMatchObject(projectSearchText('봄 카페'));
  });
  test('preserves Unicode hyphen separators in address numbers', () => {
    for (const separator of ['-', '‐', '‑', '–', '－']) {
      expect(projectSearchText(`서울 강남구 123${separator}4`).addressTokens).toEqual([
        '서울',
        '강남구',
        '123-4',
      ]);
    }
  });
  test('accepts name, address, and combined input without guessing a split', () => {
    for (const raw of ['봄카페', '서울특별시 강남구 테헤란로 12-3', '봄카페 서울 강남구 12-3']) {
      const result = prepareSearchQuery(raw);
      expect(result.ok).toBe(true);
      expect(result.original).toBe(raw);
      if (result.ok) expect(result.addressTokens.join(' ')).toBe(result.addressKey);
    }
  });
  test('rejects empty and whitespace-only input with guidance', () => {
    for (const raw of ['', ' \t\n\u00a0\u3000 ']) {
      expect(prepareSearchQuery(raw)).toEqual({
        ok: false,
        original: raw,
        reason: 'empty',
        message: '상호명 또는 주소를 입력해 주세요.',
      });
    }
  });
  test('counts visible characters after normalization at the one/two boundary', () => {
    for (const raw of ['가', '  Ａ ', 'e\u0301', '👨‍👩‍👧‍👦', '가', '가 &nbsp;']) {
      expect(prepareSearchQuery(raw)).toMatchObject({ ok: false, reason: 'too_short' });
    }
    for (const raw of ['가나', '가 나', '12', 'éé']) expect(prepareSearchQuery(raw).ok).toBe(true);
  });
  test('matches source V1 normalization without changing original punctuation', () => {
    expect(normalizeSearchText('  ＡＢＣ\tStraße\u00a0상점  ')).toBe('abc straße 상점');
    expect(normalizeSearchText('Ａ-１, １０１호')).toBe('a-1, 101호');
    const raw = '  ＡＢＣ, 카페 &amp; 빵  ';
    expect(prepareSearchQuery(raw)).toMatchObject({ original: raw, nameKey: 'abc 카페 빵' });
  });
  test('preserves address numbers, hyphens, and administrative tokens', () => {
    expect(prepareSearchQuery('서울특별시 강남구 역삼동 １２３-４ (１０１호)')).toMatchObject({
      addressTokens: ['서울특별시', '강남구', '역삼동', '123-4', '101', '호'],
    });
    expect(prepareSearchQuery('서울 강남구 테헤란로12길 34-5')).toMatchObject({
      addressTokens: ['서울', '강남구', '테헤란로', '12', '길', '34-5'],
    });
  });
  test('decodes bounded HTML notation once and keeps markup inert', () => {
    expect(prepareSearchQuery('봄&nbsp;카페 &#38; &#xBE75;')).toMatchObject({
      nameKey: '봄 카페 빵',
    });
    expect(prepareSearchQuery('<img src=x onerror=alert(1)>')).toMatchObject({
      original: '<img src=x onerror=alert(1)>',
    });
    expect(prepareSearchQuery('카페 &unknown; &#0; &#xD800; &#99999999;').ok).toBe(true);
    expect(prepareSearchQuery('&amp;nbsp; 카페')).toMatchObject({ nameKey: 'nbsp 카페' });
  });
  test('normalizes uppercase common entity and hexadecimal notation', () => {
    expect(projectSearchText('봄&AMP;카페 &#XBE75;')).toEqual(projectSearchText('봄&카페 빵'));
  });
  test('rejects punctuation-only input and never counts separators as a second character', () => {
    for (const raw of ['...', '&amp;', ' - () ', '가!!!', '가 -']) {
      expect(prepareSearchQuery(raw).ok).toBe(false);
    }
  });
  test('returns deterministic independent values', () => {
    const first = prepareSearchQuery('봄 카페');
    if (first.ok) first.addressTokens.push('changed');
    expect(prepareSearchQuery('봄 카페')).toMatchObject({ addressTokens: ['봄', '카페'] });
  });
});
