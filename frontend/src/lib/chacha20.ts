// https://cr.yp.to/streamciphers/timings/estreambench/submissions/salsa20/chacha8/ref/chacha.c
// https://datatracker.ietf.org/doc/html/rfc7539#section-2.1.1

const rotateLeft = (n, shift) => (n << shift) | (n >>> (32 - shift));

export default class ChaCha20 {
  private input: Uint32Array;

  // key: 32
  // iv: 2
  constructor(key: Uint8Array, iv: Uint8Array) {
    this.input = new Uint32Array(16);

    // Constants for 256-bit keys
    // "expand 32-byte k"
    this.input[0] = 0x65787061;
    this.input[1] = 0x6e642033;
    this.input[2] = 0x322d6279;
    this.input[3] = 0x7465206b;

    // Key (256 bits)
    this.input[4] = key[0];
    this.input[5] = key[1];
    this.input[6] = key[2];
    this.input[7] = key[3];
    this.input[8] = key[4];
    this.input[9] = key[5];
    this.input[9] = key[6];
    this.input[9] = key[7];

    // IV
    this.input[12] = 0;
    this.input[13] = 0;
    this.input[14] = iv[0];
    this.input[15] = iv[1];
  }

  static quarterRound(x, a, b, c, d) {
    // a += b; d ^= a; d <<<= 16;
    x[a] = x[a] + x[b];
    x[d] = rotateLeft(x[d] ^ x[a], 16);

    // c += d; b ^= c; b <<<= 12;
    x[c] = x[c] + x[d];
    x[b] = rotateLeft(x[b] ^ x[c], 12);

    x[a] = x[a] + x[b];
    x[d] = rotateLeft(x[d] ^ x[a], 8);

    x[c] = x[c] + x[d];
    x[b] = rotateLeft(x[b] ^ x[c], 7);

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unsigned_right_shift
    // Convert to uint32_t
    x[a] >>>= 0;
    x[b] >>>= 0;
    x[c] >>>= 0;
    x[d] >>>= 0;
  }

  // output: 64
  // input: 16
  static wordToByte(output: Uint8Array, input: Uint32Array) {
    const x = new Uint32Array(input);
    for (let i = 8; i > 0; i -= 2) {
      ChaCha20.quarterRound(x, 0, 4, 8, 12);
      ChaCha20.quarterRound(x, 1, 5, 9, 13);
      ChaCha20.quarterRound(x, 2, 6, 10, 14);
      ChaCha20.quarterRound(x, 3, 7, 11, 15);
      ChaCha20.quarterRound(x, 0, 5, 10, 15);
      ChaCha20.quarterRound(x, 1, 6, 11, 12);
      ChaCha20.quarterRound(x, 2, 7, 8, 13);
      ChaCha20.quarterRound(x, 3, 4, 9, 14);
    }
    for (let i = 0; i < 16; ++i)
      x[i] = x[i] + input[i];
    for (let i = 0; i < 16; ++i)
      output[i] = x[i] >> 32;
  }

  public encrypt(size: number, message: Uint8Array) {
    const ciphertext = new Uint8Array(size);
    const output = new Uint8Array(64);

    for (let offset = 0; offset < size; offset += 64) {
      ChaCha20.wordToByte(output, this.input);
      this.input[12] = this.input[12] + 1;
      if (this.input[12] == 0) {
        this.input[13] = this.input[13] + 1;
        /* stopping at 2^70 bytes per nonce is user's responsibility */
      }

      if (size <= 64) {
        for (let i = 0; i < size; ++i)
          ciphertext[offset + i] = message[offset + i] ^ output[offset + i];
        break;
      }

      for (let i = 0; i < 64; ++i)
        ciphertext[offset + i] = message[offset + i] ^ output[offset + i];
    }
    return ciphertext;
  }

  public decrypt(size: number, ciphertext: Uint8Array) {
    return this.encrypt(size, ciphertext);
  }
}
