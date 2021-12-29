import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { Grid, PositionSize } from "base/Grid";
import { FiberConnectionApiType, FiberConnectionDataType, LegType } from ".";

export class Connection {
  fiber_in: number;
  fiber_out: number;
  parentGrid: Grid;
  legs: LegType[] = [];

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

  calculatePositionSize() {
    const fiberIn: Fiber | undefined = this.parentGrid.getFiberById(
      this.fiber_in
    );
    const fiberOut: Fiber | undefined = this.parentGrid.getFiberById(
      this.fiber_out
    );

    if (!fiberIn) {
      return;
      // TODO: throw error when splitters are implemented.
      // throw `Fiber with id ${this.fiber_in} not found`;
    }

    if (!fiberOut) {
      return;
      // TODO: throw error when splitters are implemented.
      // throw `Fiber with id ${this.fiber_out} not found`;
    }

    if (!fiberIn.parentTube.expanded) {
      return;
    }

    this.addLegForFiber(fiberIn);
    this.addLegForFiber(fiberOut);
  }

  addLegForFiber(fiber: Fiber) {
    const disposition = fiber.parentTube.parentWire.disposition;

    let x: number;
    if (disposition === "LEFT") {
      x = Config.baseUnits.wire.width + Config.baseUnits.tube.width;
    } else {
      x = Config.gridSize.width / 2;
    }

    this.legs.push({
      position: {
        x,
        y: fiber.attr.position.y,
      },
      size: {
        width:
          Config.gridSize.width / 2 -
          Config.baseUnits.wire.width -
          Config.baseUnits.tube.width,
        height: fiber.attr.size.height,
      },
      color: fiber.color,
    });
  }

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
