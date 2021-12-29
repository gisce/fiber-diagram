import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { Grid } from "base/Grid";
import { FiberConnectionApiType, FiberConnectionDataType, LegType } from ".";
import * as PathFinding from "pathfinding";

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

    const leftXOffset =
      Config.baseUnits.wire.width +
      Config.baseUnits.tube.width +
      Config.baseUnits.fiber.width +
      Config.separation * 2;

    const rightXOffset =
      Config.baseUnits.wire.width +
      Config.baseUnits.tube.width +
      Config.separation * 2;

    const fiberInOffset =
      fiberIn.parentTube.parentWire.disposition === "LEFT"
        ? leftXOffset
        : rightXOffset;
    const fiberOutOffset =
      fiberOut.parentTube.parentWire.disposition === "LEFT"
        ? leftXOffset
        : rightXOffset;

    const from = {
      x: this.getSafeX(fiberIn.attr.position.x - fiberInOffset),
      y: this.getSafeY(fiberIn.attr.position.y),
    };

    const to = {
      x: this.getSafeX(fiberOut.attr.position.x - fiberOutOffset),
      y: this.getSafeY(fiberOut.attr.position.y),
    };

    const finder = new PathFinding.BestFirstFinder({
      allowDiagonal: false,
      dontCrossCorners: false,
      heuristic: PathFinding.Heuristic.manhattan,
    } as any);

    const path = finder.findPath(
      from.x,
      from.y,
      to.x,
      to.y,
      this.parentGrid.pfGrid
    );

    this.legs = this.getLegsForPath({
      path,
      colorPair: [fiberIn.color, fiberOut.color],
    });
  }

  getLegsForPath({
    path,
    colorPair,
  }: {
    path: number[][];
    colorPair: [string, string];
  }): LegType[] {
    const offset =
      Config.baseUnits.wire.width +
      Config.baseUnits.tube.width +
      Config.baseUnits.fiber.width +
      Config.separation * 2;

    return path.map((entry) => {
      let color = colorPair[0];
      if (path.indexOf(entry) > path.length / 2) {
        color = colorPair[1];
      }
      this.parentGrid.pfGrid.setWalkableAt(entry[0], entry[1], false);
      this.parentGrid.pfGrid.setWalkableAt(
        this.getSafeX(entry[0] - 1),
        this.getSafeY(entry[1] - 1),
        false
      );
      this.parentGrid.pfGrid.setWalkableAt(
        this.getSafeX(entry[0] - 1),
        this.getSafeY(entry[1]),
        false
      );
      this.parentGrid.pfGrid.setWalkableAt(
        this.getSafeX(entry[0]),
        this.getSafeY(entry[1] - 1),
        false
      );
      this.parentGrid.pfGrid.setWalkableAt(
        this.getSafeX(entry[0] + 1),
        this.getSafeY(entry[1] + 1),
        false
      );
      this.parentGrid.pfGrid.setWalkableAt(
        this.getSafeX(entry[0] + 1),
        this.getSafeY(entry[1]),
        false
      );
      this.parentGrid.pfGrid.setWalkableAt(
        this.getSafeX(entry[0]),
        this.getSafeY(entry[1] + 1),
        false
      );
      this.parentGrid.pfGrid.setWalkableAt(
        this.getSafeX(entry[0] + 1),
        this.getSafeY(entry[1] - 1),
        false
      );
      this.parentGrid.pfGrid.setWalkableAt(
        this.getSafeX(entry[0] - 1),
        this.getSafeY(entry[1] + 1),
        false
      );

      return {
        position: {
          x: offset + entry[0],
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

  getSafeX(n: number) {
    if (n < 0) {
      return 0;
    } else if (n > this.parentGrid.pfGrid.width - 1) {
      return this.parentGrid.pfGrid.width - 1;
    } else {
      return n;
    }
  }

  getSafeY(n: number) {
    if (n < 0) {
      return 0;
    } else if (n > this.parentGrid.pfGrid.height - 1) {
      return this.parentGrid.pfGrid.height - 1;
    } else {
      return n;
    }
  }

  addLegForFiber(fiber: Fiber) {
    const disposition = fiber.parentTube.parentWire.disposition;

    let x: number;
    let width: number;

    if (disposition === "LEFT") {
      x = Config.baseUnits.wire.width + Config.baseUnits.tube.width;
      width =
        fiber.parentTube.parentWire.parentGrid.leftSideWidth -
        Config.baseUnits.wire.width -
        Config.baseUnits.tube.width;
    } else {
      x = fiber.parentTube.parentWire.parentGrid.leftSideWidth;
      width =
        fiber.parentTube.parentWire.parentGrid.rightSideWidth -
        Config.baseUnits.wire.width -
        Config.baseUnits.tube.width;
    }

    this.legs.push({
      position: {
        x,
        y: fiber.attr.position.y,
      },
      size: {
        width,
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
