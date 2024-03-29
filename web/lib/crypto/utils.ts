import { AES_GCM_IV_BYTES, AES_GCM_TAG_LENGTH, CHUNK_SIZE } from './streams'

export function generateBytes(size: number): ArrayBuffer {
  const buffer = new ArrayBuffer(size)
  const view = new Uint8Array(buffer)
  crypto.getRandomValues(view)
  return buffer
}

/**
 * Generate a 256-bit securely random key.
 * @returns 32 bytes ArrayBuffer.
 */
export function generateKey(): ArrayBuffer {
  return generateBytes(32)
}

// Likely only works for little endian systems
export function bufferToHex(buffer: ArrayBuffer): string {
  const view = new Uint8Array(buffer)
  return Array.from(view)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
}

// Likely only works for little endian systems
export function hexToBuffer(hex: string): ArrayBuffer {
  const buffer = new ArrayBuffer(hex.length / 2)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < hex.length / 2; i++)
    view[i] = Number.parseInt(hex.substr(i * 2, 2), 16)
  return buffer
}

export function hexToCryptoKey(hex: string): Promise<CryptoKey> {
  const keyData = hexToBuffer(hex)
  return crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ])
}

export function calculateEncryptedFileSize(file: File): number {
  const requiredChunks = Math.ceil(file.size / CHUNK_SIZE)
  const ivSize = requiredChunks * (AES_GCM_TAG_LENGTH / 8 + AES_GCM_IV_BYTES)
  return file.size + ivSize
}
