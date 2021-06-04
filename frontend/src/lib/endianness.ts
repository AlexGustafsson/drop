export enum Endianness {
  Little = 1,
  Big,
  Unknown,
  Right,
}

/**
 * Get the endianness of the system.
 */
export function getEndianness(): Endianness {
  const buffer = new ArrayBuffer(2);
  const array8 = new Uint8Array(buffer);
  const array16 = new Uint16Array(buffer);
  array8[0] = 0xAA;
  array8[1] = 0xBB;
  if (array16[0] === 0xBBAA)
    return Endianness.Little;
  if (array16[0] === 0xAABB)
    return Endianness.Big;
  return Endianness.Unknown;
}
