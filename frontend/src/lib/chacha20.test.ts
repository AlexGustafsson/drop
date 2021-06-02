import * as chai from "chai";
const { expect } = chai;

import ChaCha20 from "./chacha20";

describe("chacha20", () => {
  it("performs correct quarter rounds", () => {
    const x = [
      0x11111111,
      0x01020304,
      0x9b8d6f43,
      0x01234567,
    ];

    const output = [
      0xea2a92f4,
      0xcb1cf8ce,
      0x4581472e,
      0x5881c4bb,
    ];

    ChaCha20.quarterRound(x, 0, 1, 2, 3);
    expect(x[0]).to.equal(output[0]);
    expect(x[1]).to.equal(output[1]);
    expect(x[2]).to.equal(output[2]);
    expect(x[3]).to.equal(output[3]);
  });

  it("survives roundtrip", () => {
    const key = new Uint8Array([0xabcd, 0x1234, 0xabcd, 0x1234, 0xabcd, 0x1234, 0xabcd, 0x1234]);
    const iv = new Uint8Array([0xcafe, 0xbabe]);
    const message = new Uint8Array([0x6865, 0x6c6c, 0x6f77, 0x6f72, 0x6c64]);
    console.log(message);

    const encrypt = new ChaCha20(key, iv);
    const ciphertext = encrypt.encrypt(4, message);
    console.log(ciphertext);

    const decrypt = new ChaCha20(key, iv);
    const message2 = decrypt.decrypt(4, ciphertext);
    console.log(message2);
  });
});
