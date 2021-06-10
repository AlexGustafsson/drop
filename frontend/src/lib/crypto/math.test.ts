import { expect } from "chai";

import { rotateLeft } from "./math";

describe("math functions", () => {
  it("rotates left", () => {
    expect(rotateLeft(0xF000000F, 0).toString(2), "shift 0").to.equal(0xF000000F.toString(2));
    expect(rotateLeft(0xF000000F, 4).toString(2), "shift 4").to.equal(0x000000FF.toString(2));
    expect(rotateLeft(0xF000000F, 8).toString(2), "shift 8").to.equal(0x00000FF0.toString(2));
    expect(rotateLeft(0xF000000F, 12).toString(2), "shift 12").to.equal(0x0000FF00.toString(2));
    expect(rotateLeft(0xF000000F, 16).toString(2), "shift 16").to.equal(0x000FF000.toString(2));
    expect(rotateLeft(0xF000000F, 20).toString(2), "shift 20").to.equal(0x00FF0000.toString(2));
    expect(rotateLeft(0xF000000F, 24).toString(2), "shift 24").to.equal(0x0FF00000.toString(2));
    expect(rotateLeft(0xF000000F, 28).toString(2), "shift 28").to.equal(0xFF000000.toString(2));
    expect(rotateLeft(0xF000000F, 32).toString(2), "shift 32").to.equal(0xF000000F.toString(2));
  });
});
