import { expect } from 'chai'

import { DecryptionStream, EncryptionStream, FileStream } from './streams'
import { bufferToHex, hexToBuffer, hexToCryptoKey } from './utils'

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function bufferToStream(
  buffer: ArrayBuffer,
  chunkSize: number
): ReadableStream<ArrayBuffer> {
  return new ReadableStream({
    async start(controller) {
      for (let offset = 0; offset < buffer.byteLength; offset += chunkSize)
        controller.enqueue(buffer.slice(offset, offset + chunkSize))
      controller.close()
    },
  })
}

describe('encryption stream', () => {
  it('encrypts a stream', async () => {
    const key = await hexToCryptoKey(
      '4dff1f50db3a861fce01c7004afd613317248f0895f723b9c11d4855a08621d6'
    )
    const buffer = hexToBuffer('01020304050607080910121314151617')
    const stream = bufferToStream(buffer, 8)
    const reader = stream.pipeThrough(new EncryptionStream(key)).getReader()

    // Verify that chunks are the plaintext size + iv size + tag size
    let chunk = await reader.read()
    expect(chunk.value?.byteLength).to.equal(8 + 12 + 16)
    chunk = await reader.read()
    expect(chunk.value?.byteLength).to.equal(8 + 12 + 16)
  })
})

describe('encryption / decryption stream', () => {
  it('survives roundtrip', async () => {
    const key = await hexToCryptoKey(
      '4dff1f50db3a861fce01c7004afd613317248f0895f723b9c11d4855a08621d6'
    )
    const buffer = hexToBuffer('01020304050607080910121314151617')
    const stream = bufferToStream(buffer, 8)
    const reader = stream
      .pipeThrough(new EncryptionStream(key))
      .pipeThrough(new DecryptionStream(key))
      .getReader()

    // Verify that chunks are the plaintext size + iv size + tag size
    let chunk = await reader.read()
    expect(bufferToHex(chunk.value!)).to.equal('0102030405060708')
    chunk = await reader.read()
    expect(bufferToHex(chunk.value!)).to.equal('0910121314151617')
  })
})

describe('file stream', () => {
  it('reads a file in chunks', async () => {
    const buffer = hexToBuffer('01020304050607080910121314151617')
    const file = new File([buffer], 'my-file.txt')
    const fileStream = new FileStream(file, 0, 8)
    const reader = fileStream.getReader()

    const chunk1 = await reader.read()
    expect(chunk1.value?.byteLength).to.equal(8)
    expect(bufferToHex(chunk1.value!)).to.equal('0102030405060708')

    const chunk2 = await reader.read()
    expect(chunk2.value?.byteLength).to.equal(8)
    expect(bufferToHex(chunk2.value!)).to.equal('0910121314151617')
  })

  it('closes when done', async () => {
    const buffer = hexToBuffer('01020304050607080910121314151617')
    const file = new File([buffer], 'my-file.txt')
    const fileStream = new FileStream(file, 0, 8)
    const reader = fileStream.getReader()
    let chunk = await reader.read()
    expect(chunk.done).to.be.false
    chunk = await reader.read()
    expect(chunk.done).to.be.false
    chunk = await reader.read()
    expect(chunk.done).to.be.true
  })
})
