import { bufferToHex, hexToBuffer } from "../utils";

import { generateKeyMaterial, generateKeyPair } from "./";
import { expect } from "chai";

describe("Poly1305", () => {
  it("generates valid key material", () => {
    const symmetricKey = hexToBuffer("808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f");
    const nonce = hexToBuffer("000000000001020304050607");
    const expectedKey = "8ad5a08b905f81cc815040274ab29471a833b637e3fd0da508dbb8e2fdd1a646";

    const key = generateKeyMaterial(symmetricKey, nonce);
    expect(bufferToHex(key)).to.equal(expectedKey);
  });

  it("generates a valid keypair", () => {
    const symmetricKey = hexToBuffer("808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f");
    const nonce = hexToBuffer("000000000001020304050607");
    const expectedS = "a833b637e3fd0da508dbb8e2fdd1a646";
    const expectedR = "8ad5a00b905f810c8050400748b29401";

    const {s, r} = generateKeyPair(symmetricKey, nonce);
    expect(bufferToHex(s)).to.equal(expectedS);
    expect(bufferToHex(r)).to.equal(expectedR);
  });
});
