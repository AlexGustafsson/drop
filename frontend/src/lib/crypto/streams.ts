const AES_GCM_TAG_LENGTH = 128;
const AES_GCM_IV_BYTES = 12;
const CHUNK_SIZE = 1024 * 1024;

export class EncryptionStream extends TransformStream<ArrayBuffer, ArrayBuffer> {
  constructor(key: CryptoKey) {
    super({
      async transform(chunk, controller) {
        const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTES));
        const encryptedChunk = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv, tagLength: AES_GCM_TAG_LENGTH },
          key,
          chunk,
        );
        // TODO: this duplicates the entire chunk, but until ArrayBuffer.transfer
        // lands, this is our best bet
        const packagedChunk = new ArrayBuffer(encryptedChunk.byteLength + AES_GCM_IV_BYTES);
        const source = new Uint8Array(encryptedChunk);
        const destination = new Uint8Array(packagedChunk);
        destination.set(source);
        destination.set(iv, source.length);
        controller.enqueue(packagedChunk);
      }
    });
  }
}

export class DecryptionStream extends TransformStream<ArrayBuffer, ArrayBuffer> {
  constructor(key: CryptoKey) {
    super({
      async transform(packagedChunk, controller) {
        const iv = new Uint8Array(packagedChunk, packagedChunk.byteLength - AES_GCM_IV_BYTES, AES_GCM_IV_BYTES);
        const chunk = new Uint8Array(packagedChunk, 0, packagedChunk.byteLength - AES_GCM_IV_BYTES);
        const decryptedChunk = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv, tagLength: AES_GCM_TAG_LENGTH },
          key,
          chunk,
        );
        controller.enqueue(decryptedChunk);
      }
    });
  }
}

export class FileStream extends ReadableStream<ArrayBuffer> {
  public readonly file: File;

  constructor(file: File, offset=0, chunkSize=CHUNK_SIZE) {
    super({
      async pull(controller) {
        if (offset >= file.size) {
          controller.close();
          return;
        }

        const blob = file.slice(offset, offset + chunkSize);
        offset += blob.size;
        const buffer = await blob.arrayBuffer();
        controller.enqueue(buffer);
      }
    });
    this.file = file;
  }
}
