/**
 * This file holds a ChaCha20 implementation based on RFC 7539:
 * https://datatracker.ietf.org/doc/html/rfc7539#section-2
 */

// TODO: Check if a DataView can be used without being too slow:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView.

import State from "./state";

// Block is 1-based
export function encryptBlock(key: ArrayBuffer, nonce: ArrayBuffer, block: Uint8Array, blockCount: number, ciphertext: Uint8Array) {
  if (block.byteLength > ciphertext.byteLength)
    throw new Error(`The ciphertext does not fit the message: ${block.byteLength} > ${ciphertext.byteLength}`);
  if (block.byteLength > 64)
    throw new Error(`The block must not be larger than 64 bytes, was ${block.byteLength}`);

  // TODO: Reuse the same state instead, bake in with a chacha instance like go
  // check for rollback etc.
  const keyStream = new State()
    .withKey(key)
    .withBlockCount(blockCount)
    .withNonce(nonce)
    .performBlockFunction()
    .toKeyStream();

  for (let i = 0; i < block.byteLength; i++)
    ciphertext[i] = block[i] ^ keyStream[i];
}

export function encrypt(key: ArrayBuffer, nonce: ArrayBuffer, message: ArrayBuffer, ciphertext: ArrayBuffer, offset = 0) {
  if (ciphertext.byteLength > message.byteLength)
    throw new Error("The ciphertext does not fit the message");
  if (!(key instanceof ArrayBuffer))
    throw new Error("key must be ArrayBuffer");
  if (!(nonce instanceof ArrayBuffer))
    throw new Error("nonce must be ArrayBuffer");
  if (!(message instanceof ArrayBuffer))
    throw new Error("message must be ArrayBuffer");
  if (!(ciphertext instanceof ArrayBuffer))
    throw new Error("ciphertext must be ArrayBuffer");

  for (let blockOffset = 0; blockOffset < message.byteLength; blockOffset += 64) {
    const blockIndex = 1 + (blockOffset + offset) / 64;
    const blockSize = Math.min(message.byteLength - blockOffset, 64)
    const block = new Uint8Array(message, blockOffset, blockSize);
    const ciphertextBlock = new Uint8Array(ciphertext, blockOffset, blockSize);
    encryptBlock(
      key,
      nonce,
      block,
      blockIndex,
      ciphertextBlock,
    );
  }
}

// TODO: Rewrite as a generator with yield instead, no need for callback then
// TODO: Rewrite with larger block support, like the go implementation
// generate as large of a key stream that's necessary, then XOR instead
// of doing it block by block. Still make sure that it has to be on a block
// basis, that is, increasing the counter by 1 for each 64 bytes
// Should reduce call stack, memory allocations (count, not size)
export type ChunkHandler = (error: DOMException | null, chunk: ArrayBuffer | null, offset: number) => void;
export async function encryptFile(key: ArrayBuffer, nonce: ArrayBuffer, file: File, onCiphertextChunk: ChunkHandler) {
  if (!(key instanceof ArrayBuffer))
    throw new Error("key must be ArrayBuffer");
  if (!(nonce instanceof ArrayBuffer))
    throw new Error("nonce must be ArrayBuffer");

  const chunkSize = 1024 * 1024; // 1 MiB

  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();

    const readChunk = (offset: number) => {
      const actualChunkSize = Math.min(file.size - offset, chunkSize);
      const slice = file.slice(offset, offset + actualChunkSize);
      reader.readAsArrayBuffer(slice);
    };

    let offset = 0;
    reader.onload = event => {
      if (event.target === null)
        return;

      if (event.target.error) {
        onCiphertextChunk(event.target.error, null, 0);
        return;
      }

      // Encrypt each block of the chunk
      const chunk = event.target.result as ArrayBuffer;
      const ciphertext = new ArrayBuffer(chunk.byteLength);
      encrypt(key, nonce, chunk, ciphertext, offset);
      onCiphertextChunk(null, ciphertext, offset);

      offset += chunk.byteLength;
      if (offset < file.size)
        readChunk(offset);
      else
        resolve();
    };

    // Start reading
    readChunk(offset);
  });
}

export function decrypt(key: ArrayBuffer, nonce: ArrayBuffer, ciphertext: ArrayBuffer, message: ArrayBuffer) {
  encrypt(key, nonce, ciphertext, message);
}

export async function decryptFile(key: ArrayBuffer, nonce: ArrayBuffer, file: File, onMessageChunk: ChunkHandler) {
  await encryptFile(key, nonce, file, onMessageChunk);
}
