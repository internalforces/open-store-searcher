import { requireCompact } from '../shared/compact-data.js';
import type { AddressParts } from './compare-search-address.js';

const INITIAL_CAPACITY = 256;
const COMPONENT_COLUMNS = ['provinces', 'districts', 'localities', 'roads', 'numbers'] as const;

export function createAddressTarget(): AddressParts {
  return {
    province: '',
    district: '',
    locality: '',
    road: '',
    number: '',
    family: 'unspecified',
    strong: false,
    core: false,
    ambiguous: false,
    key: '',
  };
}

/** Immutable source projections without a retained object for every distinct address. */
export class PreparedAddresses {
  private readonly keys: string[] = [];
  private readonly components = [''];
  private readonly componentReferences = new Map<string, number>([['', 0]]);
  private provinces = new Uint32Array(INITIAL_CAPACITY);
  private districts = new Uint32Array(INITIAL_CAPACITY);
  private localities = new Uint32Array(INITIAL_CAPACITY);
  private roads = new Uint32Array(INITIAL_CAPACITY);
  private numbers = new Uint32Array(INITIAL_CAPACITY);
  private flags = new Uint16Array(INITIAL_CAPACITY);
  private sealed = false;

  get length(): number {
    return this.keys.length;
  }

  get componentCount(): number {
    return this.components.length;
  }

  private intern(value: string): number {
    const existing = this.componentReferences.get(value);
    if (existing !== undefined) return existing;
    const next = this.components.length;
    requireCompact(next <= 0xffffffff);
    this.components.push(value);
    this.componentReferences.set(value, next);
    return next;
  }

  private grow(): void {
    if (this.length < this.flags.length) return;
    const capacity = this.flags.length * 2;
    for (const column of COMPONENT_COLUMNS) {
      const next = new Uint32Array(capacity);
      next.set(this[column]);
      this[column] = next;
    }
    const flags = new Uint16Array(capacity);
    flags.set(this.flags);
    this.flags = flags;
  }

  add(parts: AddressParts, originalKey?: string): number {
    requireCompact(!this.sealed);
    this.grow();
    const index = this.length;
    this.provinces[index] = this.intern(parts.province);
    this.districts[index] = this.intern(parts.district);
    this.localities[index] = this.intern(parts.locality);
    this.roads[index] = this.intern(parts.road);
    this.numbers[index] = this.intern(parts.number);
    this.flags[index] =
      (parts.family === 'road' ? 1 : parts.family === 'parcel' ? 2 : 0) |
      (parts.strong ? 4 : 0) |
      (parts.core ? 8 : 0) |
      (parts.ambiguous ? 16 : 0);
    this.keys.push(
      originalKey !== undefined && parts.key === originalKey ? originalKey : parts.key,
    );
    return index;
  }

  seal(): void {
    if (this.sealed) return;
    for (const column of COMPONENT_COLUMNS) this[column] = this[column].slice(0, this.length);
    this.flags = this.flags.slice(0, this.length);
    this.sealed = true;
  }

  /** Source-only lookup: unknown query text is never inserted or retained. */
  componentReference(value: string): number {
    return this.componentReferences.get(value) ?? -1;
  }

  key(reference: number): string {
    return this.keys[reference] as string;
  }

  isRelevant(
    reference: number,
    district: number,
    anchor: number,
    family: AddressParts['family'],
  ): boolean {
    if (district > 0 && this.districts[reference] === district) return true;
    if (anchor <= 0 || family === 'unspecified') return false;
    const candidateFamily = (this.flags[reference] as number) & 3;
    return family === 'road'
      ? candidateFamily === 1 && this.roads[reference] === anchor
      : candidateFamily === 2 && this.localities[reference] === anchor;
  }

  hasConflictingDistrict(reference: number, district: number): boolean {
    const candidate = this.districts[reference] as number;
    return district !== 0 && candidate !== 0 && candidate !== district;
  }

  read(reference: number, target: AddressParts = createAddressTarget()): AddressParts {
    requireCompact(Number.isInteger(reference) && reference >= 0 && reference < this.length);
    target.province = this.components[this.provinces[reference] as number] as string;
    target.district = this.components[this.districts[reference] as number] as string;
    target.locality = this.components[this.localities[reference] as number] as string;
    target.road = this.components[this.roads[reference] as number] as string;
    target.number = this.components[this.numbers[reference] as number] as string;
    const flags = this.flags[reference] as number;
    const family = flags & 3;
    target.family = family === 1 ? 'road' : family === 2 ? 'parcel' : 'unspecified';
    target.strong = Boolean(flags & 4);
    target.core = Boolean(flags & 8);
    target.ambiguous = Boolean(flags & 16);
    target.key = this.key(reference);
    return target;
  }
}
