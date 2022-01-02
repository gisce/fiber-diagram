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
  usedYpoints: { [key: number]: boolean } = {};

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

    this.legs = [];

    // First, we determine which fusion point of the middle of the grid (connection place) is free
    let fusionYpoint: number;

    if (
      (this.parentGrid.verticalUsedIndexes[fiberIn.attr.position.y] ===
        undefined ||
        this.parentGrid.verticalUsedIndexes[fiberIn.attr.position.y] ===
          false) &&
      (this.parentGrid.verticalUsedIndexes[fiberOut.attr.position.y] ===
        undefined ||
        this.parentGrid.verticalUsedIndexes[fiberOut.attr.position.y] === false)
    ) {
      fusionYpoint = fiberIn.attr.position.y;
    } else {
      fusionYpoint = this.parentGrid.getFirstFreeIndexFromYpoint(
        fiberIn.attr.position.y
      );
    }

    this.legs = [
      ...this.legs,
      ...this.getLegsForFiber({
        fiber: fiberIn,
        toY: fusionYpoint,
      }),
      ...this.getLegsForFiber({
        fiber: fiberOut,
        toY: fusionYpoint,
      }),
    ];

    this.center = {
      x: this.parentGrid.leftSideWidth,
      y: fusionYpoint,
    };
  }

  getLegsForFiber({ fiber, toY }: { fiber: Fiber; toY: number }) {
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

    this.parentGrid.setVerticalUsedIndex(fiber.attr.position.y);
    this.parentGrid.setVerticalUsedIndex(toY);

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
