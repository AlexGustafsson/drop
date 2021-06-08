export function generateBytes(size: number): ArrayBuffer {
  const buffer = new ArrayBuffer(size);
  const view = new Uint8Array(buffer);
  crypto.getRandomValues(view);
  return buffer;
}

/**
 * Generate a 256-bit securely random key.
 * @returns 32 bytes ArrayBuffer.
 */
export function generateKey(): ArrayBuffer {
  return generateBytes(32);
}

/**
 * Generate a 96-bit securely random nonce.
 * @returns 12 bytes ArrayBuffer.
 */
export function generateNonce(): ArrayBuffer {
  return generateBytes(12);
}

// Likely only works for little endian systems
export function bufferToHex(buffer: ArrayBuffer): string {
  const view = new Uint8Array(buffer);
  return Array.from(view).map(x => x.toString(16).padStart(2, "0")).join("");
};

// Likely only works for little endian systems
export function hexToBuffer(hex: string): ArrayBuffer {
  const buffer = new ArrayBuffer(hex.length / 2);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < hex.length / 2; i++)
    view[i] = Number.parseInt(hex.substr(i * 2, 2), 16);
  return buffer;
}
