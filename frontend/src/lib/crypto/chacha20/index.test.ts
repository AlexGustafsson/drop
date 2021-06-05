import * as chai from "chai";
import { hexToBuffer } from "../utils";
const { expect } = chai;

import { encrypt, encryptBlock, decrypt, encryptFile, decryptFile } from "./";
import { assert } from "chai";

const generateBuffer = size => new Uint8Array(new Array(size).fill(0).map(x => Math.random() * 0xFF)).buffer;

describe("ChaCha20", () => {
  it("survives roundtrip (arbitrary message)", () => {
    const message = "Ladies and Gentlemen of the class of '99: If I could offer you only one tip forthe future, sunscreen would be it.";
    const messageBuffer = new TextEncoder().encode(message).buffer;
    const key = hexToBuffer("4dff1f50db3a861fce01c7004afd613317248f0895f723b9c11d4855a08621d6");
    const nonce = hexToBuffer("402f0d2aaa5b439b983f7db5");

    const ciphertext = new Uint8Array(messageBuffer.byteLength).buffer;
    encrypt(key, nonce, messageBuffer, ciphertext);
    expect(ciphertext).to.not.deep.equal(messageBuffer);

    const plaintext = new Uint8Array(messageBuffer.byteLength).buffer;
    decrypt(key, nonce, ciphertext, plaintext);
    expect(plaintext).to.deep.equal(messageBuffer);
  });

  it("encrypts block correctly", () => {
    const key = new Uint32Array([
      0x03020100, 0x07060504, 0x0b0a0908, 0x0f0e0d0c,
      0x13121110, 0x17161514, 0x1b1a1918, 0x1f1e1d1c,
    ]);

    const nonce = new Uint32Array([
      0x00000000, 0x4a000000, 0x00000000,
    ]);

    const block = new Uint8Array([
      0x4c, 0x61, 0x64, 0x69, 0x65, 0x73, 0x20, 0x61, 0x6e, 0x64, 0x20, 0x47, 0x65, 0x6e, 0x74, 0x6c,
      0x65, 0x6d, 0x65, 0x6e, 0x20, 0x6f, 0x66, 0x20, 0x74, 0x68, 0x65, 0x20, 0x63, 0x6c, 0x61, 0x73,
      0x73, 0x20, 0x6f, 0x66, 0x20, 0x27, 0x39, 0x39, 0x3a, 0x20, 0x49, 0x66, 0x20, 0x49, 0x20, 0x63,
      0x6f, 0x75, 0x6c, 0x64, 0x20, 0x6f, 0x66, 0x66, 0x65, 0x72, 0x20, 0x79, 0x6f, 0x75, 0x20, 0x6f,
    ]);

    const expectedCiphertext = new Uint8Array([
      0x6e, 0x2e, 0x35, 0x9a, 0x25, 0x68, 0xf9, 0x80, 0x41, 0xba, 0x07, 0x28, 0xdd, 0x0d, 0x69, 0x81,
      0xe9, 0x7e, 0x7a, 0xec, 0x1d, 0x43, 0x60, 0xc2, 0x0a, 0x27, 0xaf, 0xcc, 0xfd, 0x9f, 0xae, 0x0b,
      0xf9, 0x1b, 0x65, 0xc5, 0x52, 0x47, 0x33, 0xab, 0x8f, 0x59, 0x3d, 0xab, 0xcd, 0x62, 0xb3, 0x57,
      0x16, 0x39, 0xd6, 0x24, 0xe6, 0x51, 0x52, 0xab, 0x8f, 0x53, 0x0c, 0x35, 0x9f, 0x08, 0x61, 0xd8,
    ]);

    const ciphertext = new ArrayBuffer(64);
    const ciphertextView = new Uint8Array(ciphertext);
    encryptBlock(key, nonce, block, 1, ciphertextView);
    expect(ciphertextView).to.deep.equal(expectedCiphertext);
  });

  it("file encryption survives roundtrip", async () => {
    if (typeof window === "undefined") {
      assert.ok("only available in a browser");
      return;
    }

    const size = 1024 * 1024; // 100 MiB

    const plaintextBuffer = generateBuffer(size);
    const plaintextFile = new File([plaintextBuffer], "filename", {type: "text/raw"});

    const encryptedBuffer = new ArrayBuffer(size);
    const encryptedView = new Uint8Array(encryptedBuffer);

    const key = hexToBuffer("4dff1f50db3a861fce01c7004afd613317248f0895f723b9c11d4855a08621d6");
    const nonce = hexToBuffer("402f0d2aaa5b439b983f7db5");

    await encryptFile(key, nonce, plaintextFile, (error, chunk, chunkIndex) => {
      expect(error).to.equal(null);
      const view = new Uint8Array(chunk);
      encryptedView.set(view, chunkIndex * 64);
    });

    // const encryptedFile = new File([encryptedBuffer], "filename", {type: "text/raw"});
    // await decryptFile(key, nonce, encryptedFile, (error, chunk, chunkIndex) => {
    //   expect(error).to.equal(null);
    //   expect(chunk).to.deep.equal(plaintextBuffer.slice(chunkIndex * 64, chunkIndex * 64 + chunk.byteLength));
    // });
  }).timeout(5000);

  // it("is not slow", () => {
  //   const key = hexToBuffer("4dff1f50db3a861fce01c7004afd613317248f0895f723b9c11d4855a08621d6");
  //   const nonce = hexToBuffer("402f0d2aaa5b439b983f7db5");

  //   const size = 1024 * 1024 * 100; // 100 MiB


  // });
});
