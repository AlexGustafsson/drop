import { expect } from 'chai'

import { bufferToHex, hexToBuffer } from './utils'

describe('hex functions', () => {
  it('converts to hex', () => {
    const buffer = new Uint8Array([0x01, 0x02, 0x03, 0xab, 0xcd, 0xef])
    const hex = bufferToHex(buffer)
    expect(hex).to.equal('010203abcdef')
  })

  it('converts from hex', () => {
    const hex = '010203abcdef'
    const buffer = hexToBuffer(hex)
    const expectedBuffer = new Uint8Array([0x01, 0x02, 0x03, 0xab, 0xcd, 0xef])
    expect(buffer).to.deep.equal(expectedBuffer.buffer)
    expect(buffer).to.be.instanceOf(ArrayBuffer)
  })
})
