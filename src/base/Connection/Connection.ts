import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { Grid, Position } from "base/Grid";
import { FiberConnectionApiType, FiberConnectionDataType, LegType } from ".";

export class Connection {
  fiber_in: number;
  fiber_out: number;
  parentGrid: Grid;
  legs: LegType[] = [];
  center: Position = {
    x: 0,
    y: 0,
  };

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

    this.center = {
      x: this.parentGrid.leftSideWidth,
      y: fiberIn.attr.position.y,
    };

    this.legs = [];
    // First we draw a path from fiberIn to the middle of the grid, same height.
    this.legs = [...this.legs, ...this.getSimpleLegForFiber(fiberIn)];

    // We get the second part of the path from the middle of the grid to the fiberOut

    // If both fibers are in the same level, we can connect them directly.
    if (fiberOut.attr.position.y === fiberIn.attr.position.y) {
      this.legs = [...this.legs, ...this.getSimpleLegForFiber(fiberOut)];
      return;
    }

    // Else, we have to calculate the path.
    this.legs = [
      ...this.legs,
      ...this.getComplexLegForFiber({
        fiber: fiberOut,
        toY: fiberIn.attr.position.y,
      }),
    ];
  }

  getSimpleLegForFiber(fiber: Fiber) {
    const path = [];

    if (fiber.attr.position.x <= this.parentGrid.leftSideWidth) {
      // Left to right
      for (
        let iX = fiber.attr.position.x;
        iX < this.parentGrid.leftSideWidth;
        iX++
      ) {
        path.push([iX, fiber.attr.position.y]);
      }
    } else {
      // Right to left
      for (
        let iX = fiber.attr.position.x;
        iX >= this.parentGrid.leftSideWidth;
        iX--
      ) {
        path.push([iX, fiber.attr.position.y]);
      }
    }

    return this.getLegsForPath({
      path,
      color: fiber.color,
    });
  }

  getComplexLegForFiber({ fiber, toY }: { fiber: Fiber; toY: number }) {
    const isLeftToRightConnection =
      fiber.parentTube.parentWire.disposition === "LEFT";
    const previousComplexConnections = isLeftToRightConnection
      ? this.parentGrid.leftSideComplexConnections
      : this.parentGrid.rightSideComplexConnections;

    const separation =
      Config.baseUnits.fiber.height * 2 +
      previousComplexConnections.length * 2 * Config.baseUnits.fiber.height;

    let angleXpoint: number;
    if (isLeftToRightConnection) {
      angleXpoint =
        this.parentGrid.leftSideWidth -
        (separation + Config.baseUnits.fiber.height);
    } else {
      angleXpoint = this.parentGrid.leftSideWidth + separation;
    }

    const path = [[angleXpoint, fiber.attr.position.y]];

    // from: fiber.attr.position.x, fiber.attr.position.y
    // to: angleXpoint, fiber.attr.position.y
    if (isLeftToRightConnection) {
      for (let iX = fiber.attr.position.x; iX < angleXpoint; iX++) {
        path.push([iX, fiber.attr.position.y]);
      }
    } else {
      for (let iX = fiber.attr.position.x; iX >= angleXpoint; iX--) {
        path.push([iX, fiber.attr.position.y]);
      }
    }

    // from: angleXpoint, fiber.attr.position.y
    // to: angleXpoint, toY
    if (fiber.attr.position.y < toY) {
      for (let iY = fiber.attr.position.y; iY < toY; iY++) {
        path.push([angleXpoint, iY]);
      }
    } else {
      for (let iY = fiber.attr.position.y; iY > toY; iY--) {
        path.push([angleXpoint, iY]);
      }
    }

    // from: angleXpoint, toY
    // to: this.parentGrid.leftSideWidth, toY
    if (isLeftToRightConnection) {
      for (let iX = angleXpoint; iX < this.parentGrid.leftSideWidth; iX++) {
        path.push([iX, toY]);
      }
    } else {
      for (let iX = angleXpoint; iX >= this.parentGrid.leftSideWidth; iX--) {
        path.push([iX, toY]);
      }
    }

    previousComplexConnections.push(this);

    return this.getLegsForPath({
      path,
      color: fiber.color,
    });
  }

  getLegsForPath({
    path,
    color,
  }: {
    path: number[][];
    color: string;
  }): LegType[] {
    return path.map((entry) => {
      return {
        position: {
          x: entry[0],
          y: entry[1],
        },
        size: {
          width: 1,
          height: 1,
        },
        color,
      };
    });
  }

  remove() {
    this.parentGrid.removeConnection(this);
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
}
