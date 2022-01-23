import { Config } from "base/Config";
import { Fiber, FiberDataType } from "base/Fiber";
import { Grid, InitialPositionSize, PositionSize } from "base/Grid";
import { SplitterDataType } from "./Splitter.types";

export class Splitter {
  id: number;
  attr?: PositionSize = { ...InitialPositionSize };
  parentGrid: Grid;
  fibers_in?: Fiber[] = [];
  fibers_out?: Fiber[] = [];
  index: number;

  constructor({
    data,
    parentGrid,
    index,
  }: {
    data: SplitterDataType;
    parentGrid: Grid;
    index: number;
  }) {
    const { id, fibers_in, fibers_out } = data;
    this.id = id;
    this.fibers_in = this.getParsedFibers(fibers_in);
    this.fibers_out = this.getParsedFibers(fibers_out);

    this.parentGrid = parentGrid;
    this.index = index;
  }

  calculateSize() {
    this.attr.size = {
      width: Config.splitterWidth + Config.baseUnits.fiber.width * 2,
      height:
        (this.fibers_out.length + this.fibers_out.length + 1) *
        Config.baseUnits.fiber.height,
    };
  }

  getParsedFibers(fibersData: FiberDataType[]) {
    return fibersData.map((fiberEntry, index) => {
      return new Fiber({
        data: { ...fiberEntry, color: Config.colorForSplitters },
        parent: this,
        index: index,
      });
    });
  }

  isFiberInput(fiber: Fiber) {
    return this.fibers_in.find((f) => f.id === fiber.id) !== undefined;
  }

  getSibilingsForFiber(fiber: Fiber) {
    const fibers = this.isFiberInput(fiber) ? this.fibers_in : this.fibers_out;
    return fibers.filter((f) => f.id !== fiber.id);
  }

  getJson() {
    return {
      id: this.id,
      fibers_in: this.fibers_in.map((fiber) => fiber.getJson()),
      fibers_out: this.fibers_out.map((fiber) => fiber.getJson()),
      index: this.index,
    };
  }
}
