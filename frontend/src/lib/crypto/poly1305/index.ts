import State from "../chacha20/state";

// Perform the clamping of the "r" key
function clamp(r: Uint8Array) {
  r[3] &= 15;
  r[7] &= 15;
  r[11] &= 15;
  r[15] &= 15;
  r[4] &= 252;
  r[8] &= 252;
  r[12] &= 252;
}

export function calculateMac(message: ArrayBuffer, key: ArrayBuffer) {
  const r = new Uint8Array();
}

/** Generate Poly1305 key material.  */
export function generateKeyMaterial(symmetricKey: ArrayBuffer, nonce: ArrayBuffer): ArrayBuffer {
  const block = new State()
    .withKey(symmetricKey)
    .withBlockCount(0)
    .withNonce(nonce)
    .performBlockFunction()
    .values;

  // Return a copy of the first 32 bytes (rest is discard as per the RFC)
  return block.slice(0, 32);
}

export type Keypair = {
  s: Uint8Array,
  r: Uint8Array
};
export function generateKeyPair(symmetricKey: ArrayBuffer, nonce: ArrayBuffer): Keypair {
  const keyMaterial = generateKeyMaterial(symmetricKey, nonce);
  const r = new Uint8Array(keyMaterial, 0, 16);
  const s = new Uint8Array(keyMaterial, 16, 16);
  clamp(r);
  return {s: s, r: r};
}
