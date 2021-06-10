import {expect} from "chai";

import State from "./state";

describe("ChaCha20 State", () => {
  it("yields correct views", () => {
    const values = new Uint32Array([
      0x879531e0, 0xc5ecf37d, 0x516461b1, 0xc9a62f8a,
      0x44c20ef3, 0x3390af7f, 0xd9fc690b, 0x2a5f714c,
      0x53372767, 0xb00a5631, 0x974c541a, 0x359e9963,
      0x5c971061, 0x3d631689, 0x2098d9d6, 0x91dbd320,
    ]);

    const state = new State().withValues(values.buffer);
    expect(state.view32[0]).to.equal(0x879531e0);
    expect(state.view8[0]).to.equal(0xe0); // TODO: Test might not work for non-little endian systems
  });

  it("performs quarter rounds on state", () => {
    const values = new Uint32Array([
      0x879531e0, 0xc5ecf37d, 0x516461b1, 0xc9a62f8a,
      0x44c20ef3, 0x3390af7f, 0xd9fc690b, 0x2a5f714c,
      0x53372767, 0xb00a5631, 0x974c541a, 0x359e9963,
      0x5c971061, 0x3d631689, 0x2098d9d6, 0x91dbd320,
    ]);

    const expectedValues = new Uint32Array([
      0x879531e0, 0xc5ecf37d, 0xbdb886dc, 0xc9a62f8a,
      0x44c20ef3, 0x3390af7f, 0xd9fc690b, 0xcfacafd2,
      0xe46bea80, 0xb00a5631, 0x974c541a, 0x359e9963,
      0x5c971061, 0xccc07c79, 0x2098d9d6, 0x91dbd320,
    ]);

    const state = new State().withValues(values.buffer);
    state.performQuarterRound(2, 7, 8, 13);
    expect(state.view32).to.deep.equal(expectedValues);
  });

  it("configures the state properly", () => {
    const key = new Uint32Array([
      0x03020100, 0x07060504, 0x0b0a0908, 0x0f0e0d0c,
      0x13121110, 0x17161514, 0x1b1a1918, 0x1f1e1d1c,
    ]);

    const blockCount = 1;

    const nonce = new Uint32Array([
      0x09000000, 0x4a000000, 0x00000000,
    ]);

    const expectedValues = new Uint32Array([
      0x61707865, 0x3320646e, 0x79622d32, 0x6b206574,
      0x03020100, 0x07060504, 0x0b0a0908, 0x0f0e0d0c,
      0x13121110, 0x17161514, 0x1b1a1918, 0x1f1e1d1c,
      0x00000001, 0x09000000, 0x4a000000, 0x00000000,
    ]);

    const state = new State()
      .withKey(key)
      .withBlockCount(blockCount)
      .withNonce(nonce);

    expect(state.view32).to.deep.equal(expectedValues);
  })

  it("performs block function", () => {
    const values = new Uint32Array([
      0x61707865, 0x3320646e, 0x79622d32, 0x6b206574,
      0x03020100, 0x07060504, 0x0b0a0908, 0x0f0e0d0c,
      0x13121110, 0x17161514, 0x1b1a1918, 0x1f1e1d1c,
      0x00000001, 0x09000000, 0x4a000000, 0x00000000,
    ]);

    const expectedValues = new Uint32Array([
      0xe4e7f110, 0x15593bd1, 0x1fdd0f50, 0xc47120a3,
      0xc7f4d1c7, 0x0368c033, 0x9aaa2204, 0x4e6cd4c3,
      0x466482d2, 0x09aa9f07, 0x05d7c214, 0xa2028bd9,
      0xd19c12b5, 0xb94e16de, 0xe883d0cb, 0x4e3c50a2,
    ]);

    const state = new State().withValues(values);
    state.performBlockFunction();
    expect(state.view32).to.deep.equal(expectedValues);
  });

  it("performs block function (alternate)", () => {
    const values = new Uint32Array([
      0x61707865, 0x3320646e, 0x79622d32, 0x6b206574,
      0x03020100, 0x07060504, 0x0b0a0908, 0x0f0e0d0c,
      0x13121110, 0x17161514, 0x1b1a1918, 0x1f1e1d1c,
      0x00000001, 0x00000000, 0x4a000000, 0x00000000,
    ]);

    const expectedValues = new Uint32Array([
      0xf3514f22, 0xe1d91b40, 0x6f27de2f, 0xed1d63b8,
      0x821f138c, 0xe2062c3d, 0xecca4f7e, 0x78cff39e,
      0xa30a3b8a, 0x920a6072, 0xcd7479b5, 0x34932bed,
      0x40ba4c79, 0xcd343ec6, 0x4c2c21ea, 0xb7417df0,
    ]);

    const state = new State().withValues(values);
    state.performBlockFunction();
    expect(state.view32).to.deep.equal(expectedValues);
  });

  it("performs block function (alternate 2)", () => {
    const values = new Uint32Array([
      0x61707865, 0x3320646e, 0x79622d32, 0x6b206574,
      0x03020100, 0x07060504, 0x0b0a0908, 0x0f0e0d0c,
      0x13121110, 0x17161514, 0x1b1a1918, 0x1f1e1d1c,
      0x00000002, 0x00000000, 0x4a000000, 0x00000000,
    ]);

    const expectedValues = new Uint32Array([
      0x9f74a669, 0x410f633f, 0x28feca22, 0x7ec44dec,
      0x6d34d426, 0x738cb970, 0x3ac5e9f3, 0x45590cc4,
      0xda6e8b39, 0x892c831a, 0xcdea67c1, 0x2b7e1d90,
      0x037463f3, 0xa11a2073, 0xe8bcfb88, 0xedc49139,
    ]);

    const state = new State().withValues(values);
    state.performBlockFunction();
    expect(state.view32).to.deep.equal(expectedValues);
  });

  it("creates keystream", () => {
    const key = new Uint32Array([
      0x03020100, 0x07060504, 0x0b0a0908, 0x0f0e0d0c,
      0x13121110, 0x17161514, 0x1b1a1918, 0x1f1e1d1c,
    ]);

    const blockCount = 1;

    const nonce = new Uint32Array([
      0x00000000, 0x4a000000, 0x00000000,
    ]);

    const expectedKeyStream = new Uint8Array([
      0x22, 0x4f, 0x51, 0xf3, 0x40, 0x1b, 0xd9, 0xe1, 0x2f, 0xde, 0x27, 0x6f, 0xb8, 0x63, 0x1d, 0xed,
      0x8c, 0x13, 0x1f, 0x82, 0x3d, 0x2c, 0x06, 0xe2, 0x7e, 0x4f, 0xca, 0xec, 0x9e, 0xf3, 0xcf, 0x78,
      0x8a, 0x3b, 0x0a, 0xa3, 0x72, 0x60, 0x0a, 0x92, 0xb5, 0x79, 0x74, 0xcd, 0xed, 0x2b, 0x93, 0x34,
      0x79, 0x4c, 0xba, 0x40, 0xc6, 0x3e, 0x34, 0xcd, 0xea, 0x21, 0x2c, 0x4c, 0xf0, 0x7d, 0x41, 0xb7,
    ]);

    const keyStream = new State()
      .withKey(key)
      .withBlockCount(blockCount)
      .withNonce(nonce)
      .performBlockFunction()
      .toKeyStream();
    expect(keyStream).to.deep.equal(expectedKeyStream);
  });
});
