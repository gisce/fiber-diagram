import { Config } from "base/Config";
import { Grid, InitialPositionSize, PositionSize } from "base/Grid";
import { Tube } from "base/Tube";
import { FiberConnectionApiType, FiberConnectionDataType } from ".";

export class Connection {
  fiber_in: number;
  fiber_out: number;
  parentGrid: Grid;

  constructor({
    data,
    parentGrid,
  }: {
    data: FiberConnectionDataType;
    parentGrid: Grid;
  }) {
    const { fiber_in, fiber_out } = data;
    this.fiber_in = fiber_in;
    this.fiber_out = fiber_out;
    this.parentGrid = parentGrid;
  }

  calculateSize() {}

  calculatePosition() {}

  onChangeIfNeeded() {}

  getApiJson(): FiberConnectionApiType {
    const { fiber_in, fiber_out } = this;
    return {
      fiber_in,
      fiber_out,
    };
  }

  getJson(): FiberConnectionDataType {
    const { fiber_in, fiber_out } = this;
    return {
      fiber_in,
      fiber_out,
    };
  }
}
