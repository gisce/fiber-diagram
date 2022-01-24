import { IndexController } from ".";

const ic = new IndexController();

describe("An IndexController", () => {
  it("Must return points below x point", () => {
    ic.indexes = {
      49: true,
    };

    const freeIndexes = ic.getFreeBelowIndexes({
      n: 3,
      unitSize: 1,
      point: 49,
    });

    console.log();

    // Expect 48, 47, 46
    expect(freeIndexes).toHaveLength(3);
    expect(freeIndexes.indexOf(47)).not.toEqual(-1);
    expect(freeIndexes.indexOf(46)).not.toEqual(-1);
    expect(freeIndexes.indexOf(45)).not.toEqual(-1);
  });
});
