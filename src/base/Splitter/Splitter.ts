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

  parseFibers() {}

  getParsedFibers(fibersData: FiberDataType[]) {
    return fibersData.map((fiberEntry, index) => {
      return new Fiber({
        data: { ...fiberEntry, color: Config.colorForSplitters },
        parent: this,
        index: index,
      });
    });
  }

  getApiJson() {
    return {
      id: this.id,
      fibers_in: this.fibers_in.map((fiber) => fiber.getApiJson()),
      fibers_out: this.fibers_out.map((fiber) => fiber.getApiJson()),
    };
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
