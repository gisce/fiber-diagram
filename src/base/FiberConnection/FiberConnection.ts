import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { Grid, LegType, Position } from "base/Grid";
import { FiberConnectionApiType, FiberConnectionDataType } from ".";

export class FiberConnection {
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

  fiberIdBelongsToConnection(fiber_id: number) {
    const { fiber_in, fiber_out } = this;
    return fiber_id === fiber_in || fiber_id === fiber_out;
  }

  getOtherFiberId(id: number) {
    const { fiber_in, fiber_out } = this;
    return id === fiber_in ? fiber_out : fiber_in;
  }

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

  remove() {
    this.parentGrid.removeFiberConnection({
      fiber_in: this.fiber_in,
      fiber_out: this.fiber_out,
    });
  }
}
