import {rotateLeft} from "../math";

/**
 * A ChaCha20 state.
 */
export default class State {
  /** The raw values (64 bytes) representing the state. */
  public values: ArrayBuffer;
  public view32: Uint32Array;
  public view8: Uint8Array;

  constructor() {
    this.values = new ArrayBuffer(64);
    this.view32 = new Uint32Array(this.values);
    this.view8 = new Uint8Array(this.values);

    // c = constant k = key b = blockcount n = nonce
    // cccccccc  cccccccc  cccccccc  cccccccc
    // kkkkkkkk  kkkkkkkk  kkkkkkkk  kkkkkkkk
    // kkkkkkkk  kkkkkkkk  kkkkkkkk  kkkkkkkk
    // bbbbbbbb  nnnnnnnn  nnnnnnnn  nnnnnnnn
    this.view32.set([
      // Defined constants
      0x61707865, 0x3320646e, 0x79622d32, 0x6b206574,
      // Placeholders
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]);
  }

  /**
   * Initialize the state with values.
   * @returns The modified state.
   */
  withValues(values: ArrayBuffer): State {
    if (values.byteLength != 64)
      throw new Error("State values must be 64 bytes");

    this.values = values;
    this.view32 = new Uint32Array(this.values);
    this.view8 = new Uint8Array(this.values);
    return this;
  }

  /**
   * Initialize the state with a key.
   * @returns The modified state.
   */
  withKey(key: ArrayBuffer): State {
    if (key.byteLength != 32)
      throw new Error(`Key must be 32 bytes, was ${key.byteLength}`);

    const view = new Uint32Array(key);
    this.view32.set(view, 4);
    return this;
  }

  /**
   * Initialize the state with a block count.
   * @returns The modified state.
   */
  withBlockCount(count: number): State {
    this.view32[12] = count;
    return this;
  }

  /**
   * Initialize the state with a nonce.
   * @returns The modified state.
   */
  withNonce(nonce: ArrayBuffer): State {
    if (nonce.byteLength != 12)
      throw new Error(`Nonce must be 12 bytes, was ${nonce.byteLength}`);

    const view = new Uint32Array(nonce);
    this.view32.set(view, 13);
    return this;
  }

  /**
   * Perform the ChaCha20 quarter round.
   */
  performQuarterRound(a: number, b: number, c: number, d: number) {
    // a += b; d ^= a; d <<<= 16;
    this.view32[a] += this.view32[b];
    this.view32[d] = rotateLeft(this.view32[d] ^ this.view32[a], 16);

    // c += d; b ^= c; b <<<= 12;
    this.view32[c] += this.view32[d];
    this.view32[b] = rotateLeft(this.view32[b] ^ this.view32[c], 12);

    // a += b; d ^= a; d <<<= 8;
    this.view32[a] += this.view32[b];
    this.view32[d] = rotateLeft(this.view32[d] ^ this.view32[a], 8);

    // c += d; b ^= c; b <<<= 7;
    this.view32[c] += this.view32[d];
    this.view32[b] = rotateLeft(this.view32[b] ^ this.view32[c], 7);

    // Unnecessary?
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unsigned_right_shift
    // Convert to uint32_t
    // this.values[a] >>>= 0;
    // this.values[b] >>>= 0;
    // this.values[c] >>>= 0;
    // this.values[d] >>>= 0;
  }

  // 256-bit key
  // 96-bit nonce
  // 32-bit block count
  // out: 64 bytes
  /*
Note also that the original ChaCha had a 64-bit nonce and 64-bit
   block count.  We have modified this here to be more consistent with
   recommendations in Section 3.2 of [RFC5116].  This limits the use of
   a single (key,nonce) combination to 2^32 blocks, or 256 GB, but that
   is enough for most uses.  In cases where a single key is used by
   multiple senders, it is important to make sure that they don't use
   the same nonces.  This can be assured by partitioning the nonce space
   so that the first 32 bits are unique per sender, while the other 64
   bits come from a counter.
  */
  performBlockFunction(): State {
    // Create a duplicate of the state
    const workingState = new State().withValues(this.values.slice(0));

    for (let i = 1; i <= 10; i++) {
      workingState.performQuarterRound(0, 4, 8, 12);
      workingState.performQuarterRound(1, 5, 9, 13);
      workingState.performQuarterRound(2, 6, 10, 14);
      workingState.performQuarterRound(3, 7, 11, 15);
      workingState.performQuarterRound(0, 5, 10, 15);
      workingState.performQuarterRound(1, 6, 11, 12);
      workingState.performQuarterRound(2, 7, 8, 13);
      workingState.performQuarterRound(3, 4, 9, 14);
    }

    for (let i = 0; i < 16; i++)
      this.view32[i] = (this.view32[i] + workingState.view32[i]) >>> 0;

    return this;
  }

  /**
   * Create a key stream of the state.
   * @returns 64 bytes representing the key stream.
   */
  toKeyStream(): Uint8Array {
    return this.view8;
  }
}
