/** Owned in-memory strings with exact UTF-16 units and no per-value heap objects. */
export class PackedStringValues {
  private readonly offsets: Uint32Array;
  private readonly units: Uint8Array | Uint16Array;
  readonly length: number;

  constructor(values: readonly string[]) {
    this.length = values.length;
    this.offsets = new Uint32Array(values.length + 1);
    let length = 0;
    let latin = true;
    for (let index = 0; index < values.length; index++) {
      const value = values[index] as string;
      length += value.length;
      if (!Number.isSafeInteger(length) || length > 0xffffffff)
        throw new Error('String column is too large');
      this.offsets[index + 1] = length;
      if (latin)
        for (let unit = 0; unit < value.length; unit++)
          if (value.charCodeAt(unit) > 0xff) {
            latin = false;
            break;
          }
    }
    this.units = latin ? new Uint8Array(length) : new Uint16Array(length);
    let offset = 0;
    for (const value of values)
      for (let unit = 0; unit < value.length; unit++) this.units[offset++] = value.charCodeAt(unit);
  }

  get byteLength(): number {
    return this.offsets.byteLength + this.units.byteLength;
  }

  at(index: number): string | undefined {
    if (!Number.isInteger(index) || index < 0 || index >= this.length) return undefined;
    const end = this.offsets[index + 1] as number;
    let result = '';
    for (let start = this.offsets[index] as number; start < end; start += 8_192)
      result += String.fromCharCode(...this.units.subarray(start, Math.min(start + 8_192, end)));
    return result;
  }
}
