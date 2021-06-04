/**
 * Bitwise rotate. Safe for integer counts between 0 and 32 (inclusive).
 * @param value The number to rotate.
 * @param count The number of bits to rotate.
 * @returns The rotated value.
 */
export const rotateLeft = (value: number, count: number) => ((value << count) | (value >>> (32 - count))) >>> 0;
