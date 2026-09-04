import { describe, expect, test } from 'vitest';
import { mapLicenseStatusV1 } from './map-license-status.js';

// Synthetic TASK-007 fixtures pin ADR-013 exact spelling; change only with an approved mapping ADR.
const approved = [
  ['01', '영업/정상', '행정상 영업'],
  ['02', '휴업', '휴업'],
  ['03', '폐업', '폐업'],
  ['04', '취소/말소/만료/정지/중지', '확인되지 않음'],
] as const;

describe('ADR-013 status mapping v1 (FR-04, FR-07)', () => {
  test.each(approved)(
    'maps the approved pair %s / %s',
    (operatingCode, operatingName, expected) => {
      expect(mapLicenseStatusV1({ operatingCode, operatingName })).toBe(expected);
    },
  );

  const codes = [null, '', '01', '02', '03', '04', '99', '1', 'toString'];
  const names = [null, '', ...approved.map((pair) => pair[1]), '영업 중', 'unknown', '__proto__'];
  const unapproved = codes.flatMap((code) =>
    names
      .filter((name) => !approved.some((pair) => pair[0] === code && pair[1] === name))
      .map((name) => [code, name] as const),
  );
  test.each(unapproved)(
    'fails safely for aggregate combination %j / %j',
    (operatingCode, operatingName) => {
      expect(mapLicenseStatusV1({ operatingCode, operatingName })).toBe('확인되지 않음');
    },
  );

  test.each(approved)('rejects whitespace and Unicode variants of %s / %s', (code, name) => {
    for (const padding of [' ', '\t', '\r\n', '\u00a0', '\u3000', '\u200b', '\ufeff']) {
      for (const operatingCode of [padding + code, code + padding]) {
        expect(mapLicenseStatusV1({ operatingCode, operatingName: name })).toBe('확인되지 않음');
      }
      for (const operatingName of [padding + name, name + padding]) {
        expect(mapLicenseStatusV1({ operatingCode: code, operatingName })).toBe('확인되지 않음');
      }
    }
    const fullwidth = code.replace(/[0-9]/g, (digit) =>
      String.fromCharCode(digit.charCodeAt(0) + 0xfee0),
    );
    expect(mapLicenseStatusV1({ operatingCode: fullwidth, operatingName: name })).toBe(
      '확인되지 않음',
    );
    expect(mapLicenseStatusV1({ operatingCode: code, operatingName: name.normalize('NFD') })).toBe(
      '확인되지 않음',
    );
  });

  test('does not read or mutate detailed evidence', () => {
    for (const [operatingCode, operatingName, expected] of approved) {
      const raw = Object.freeze({
        operatingCode,
        operatingName,
        get detailedCode(): never {
          throw new Error('Detailed code must not be interpreted');
        },
        get detailedName(): never {
          throw new Error('Detailed name must not be interpreted');
        },
      });
      expect(mapLicenseStatusV1(raw)).toBe(expected);
      expect(mapLicenseStatusV1(raw)).toBe(expected);
      expect(raw.operatingCode).toBe(operatingCode);
      expect(raw.operatingName).toBe(operatingName);
    }
    expect(mapLicenseStatusV1({ operatingCode: '01', operatingName: '영업／정상' })).toBe(
      '확인되지 않음',
    );
  });
});
