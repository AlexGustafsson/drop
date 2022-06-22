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
  const buffer = new ArrayBuffer(2)
  const array8 = new Uint8Array(buffer)
  const array16 = new Uint16Array(buffer)
  array8[0] = 0xaa
  array8[1] = 0xbb
  if (array16[0] === 0xbbaa) return Endianness.Little
  if (array16[0] === 0xaabb) return Endianness.Big
  return Endianness.Unknown
}
