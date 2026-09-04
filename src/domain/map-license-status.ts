export type ProcessedStatusV1 = '행정상 영업' | '휴업' | '폐업' | '확인되지 않음';

export interface AggregateLicenseStatusV1 {
  readonly operatingCode: string | null;
  readonly operatingName: string | null;
}

/** ADR-013: only exact approved aggregate pairs classify; detailed evidence is not interpreted. */
export function mapLicenseStatusV1(raw: AggregateLicenseStatusV1): ProcessedStatusV1 {
  if (raw.operatingCode === '01' && raw.operatingName === '영업/정상') return '행정상 영업';
  if (raw.operatingCode === '02' && raw.operatingName === '휴업') return '휴업';
  if (raw.operatingCode === '03' && raw.operatingName === '폐업') return '폐업';
  return '확인되지 않음';
}
