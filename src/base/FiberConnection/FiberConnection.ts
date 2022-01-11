import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { Grid, LegType, Position } from "base/Grid";
import { getUnitsForPath } from "utils/pathUtils";
import { FiberConnectionApiType, FiberConnectionDataType } from ".";

export class FiberConnection {
  fiber_in: number;
  fiber_out: number;
  parentGrid: Grid;
  legs: LegType[] = [];
  center: Position = {
    x: 0,
    y: 0,
  };
  usedYpoints: { [key: number]: boolean } = {};
  onInitializeDone?: (connection: FiberConnection) => void;

  constructor({
    data,
    parentGrid,
    onInitializeDone,
  }: {
    data: FiberConnectionDataType;
    parentGrid: Grid;
    onInitializeDone?: (connection: FiberConnection) => void;
  }) {
    const { fiber_in, fiber_out } = data;
    this.fiber_in = fiber_in;
    this.fiber_out = fiber_out;
    this.parentGrid = parentGrid;
    this.onInitializeDone = onInitializeDone;
  }

  calculatePositionSize() {
    const fiberIn: Fiber | undefined = this.parentGrid.getFiberById(
      this.fiber_in
    );

    const fiberOut: Fiber | undefined = this.parentGrid.getFiberById(
      this.fiber_out
    );

    if (!fiberIn) {
      this.onInitializeDone(this);
      return;
      // TODO: throw error when splitters are implemented.
      // throw `Fiber with id ${this.fiber_in} not found`;
    }

    if (!fiberOut) {
      this.onInitializeDone(this);
      return;
      // TODO: throw error when splitters are implemented.
      // throw `Fiber with id ${this.fiber_out} not found`;
    }

    if (!fiberIn.parentTube.expanded) {
      this.onInitializeDone(this);
      return;
    }

    const getLegsFn =
      fiberIn.parentTube.parentWire.disposition ===
      fiberOut.parentTube.parentWire.disposition
        ? this.getSameSideLegs.bind(this)
        : this.getLeftToRightLegs.bind(this);

    const { legs, center } = getLegsFn({
      fiberIn,
      fiberOut,
    });

    this.legs = [...legs];

    this.center = {
      x: this.parentGrid.leftSideWidth,
      y: center,
    };

    this.onInitializeDone(this);
  }

  getLeftToRightLegs({
    fiberIn,
    fiberOut,
  }: {
    fiberIn: Fiber;
    fiberOut: Fiber;
  }) {
    // First, we determine which fusion point of the middle of the grid (connection place) is free
    const { modifiedHeight, freeIndexes } =
      this.parentGrid.getNFreeIndexesFromYpoint({
        unitSize: Config.baseUnits.fiber.height,
        n: 3,
        fromY: fiberIn.attr.position.y,
      });

    if (modifiedHeight) {
      this.parentGrid.size.height = modifiedHeight;
    }

    const fusionYpoint: number = freeIndexes[0];

    return {
      legs: [
        ...getUnitsForPath({
          path: this.getPathForFiberConnection({
            fiber: fiberIn,
            toY: fusionYpoint,
          }),
          color: fiberIn.color,
          unitSize: Config.baseUnits.fiber.height,
        }),
        ...getUnitsForPath({
          path: this.getPathForFiberConnection({
            fiber: fiberOut,
            toY: fusionYpoint,
          }),
          color: fiberOut.color,
          unitSize: Config.baseUnits.fiber.height,
        }),
      ],
      center: fusionYpoint,
    };
  }

  getSameSideLegs({ fiberIn, fiberOut }: { fiberIn: Fiber; fiberOut: Fiber }) {
    let modifiedHeight: number | undefined;

    // First, we determine which two fusion point of the middle of the grid (connection place) is free
    const { modifiedHeight: inModifiedHeight, freeIndexes: inFreeIndexes } =
      this.parentGrid.getNFreeIndexesFromYpoint({
        unitSize: Config.baseUnits.fiber.height,
        n: 3,
        fromY: fiberIn.attr.position.y,
      });

    const [fusionInYpoint1, fusionInYpoint2, fusionInYpoint3] = inFreeIndexes;

    const { modifiedHeight: outModifiedHeight, freeIndexes: outFreeIndexes } =
      this.parentGrid.getNFreeIndexesFromYpoint({
        unitSize: Config.baseUnits.fiber.height,
        n: 3,
        fromY: fiberOut.attr.position.y,
      });

    const [fusionOutYpoint1, fusionOutYpoint2, fusionOutYpoint3] =
      outFreeIndexes;

    let fusionYpoint1: number, fusionYpoint2: number, fusionYpoint3: number;

    if (fusionInYpoint1 < fusionOutYpoint1) {
      modifiedHeight = inModifiedHeight;
      fusionYpoint1 = fusionInYpoint1;
      fusionYpoint2 = fusionInYpoint2;
      fusionYpoint3 = fusionInYpoint3;
    } else {
      modifiedHeight = outModifiedHeight;
      fusionYpoint1 = fusionOutYpoint1;
      fusionYpoint2 = fusionOutYpoint2;
      fusionYpoint3 = fusionOutYpoint3;
    }

    if (modifiedHeight) {
      this.parentGrid.size.height = modifiedHeight;
    }

    this.parentGrid.setVerticalUsedIndexWithHeight({
      yPoint: fusionYpoint1,
      height: Config.baseUnits.fiber.height,
    });
    this.parentGrid.setVerticalUsedIndexWithHeight({
      yPoint: fusionYpoint2,
      height: Config.baseUnits.fiber.height,
    });
    this.parentGrid.setVerticalUsedIndexWithHeight({
      yPoint: fusionYpoint3,
      height: Config.baseUnits.fiber.height,
    });

    const centerUpperMiddleDot = getUnitsForPath({
      unitSize: Config.baseUnits.fiber.height,
      color:
        fusionInYpoint1 < fusionOutYpoint1 ? fiberIn.color : fiberOut.color,
      path: [
        [
          this.parentGrid.leftSideWidth - Config.baseUnits.fiber.height / 2,
          fusionYpoint1,
        ],
        [
          this.parentGrid.leftSideWidth - Config.baseUnits.fiber.height / 2,
          fusionYpoint2,
        ],
      ],
    });

    const centerLowerMiddleDot = getUnitsForPath({
      unitSize: Config.baseUnits.fiber.height,
      color:
        fusionInYpoint1 < fusionOutYpoint1 ? fiberOut.color : fiberIn.color,
      path: [
        [
          this.parentGrid.leftSideWidth - Config.baseUnits.fiber.height / 2,
          fusionYpoint3,
        ],
      ],
    });

    const firstPath = this.getPathForFiberConnection({
      fiber: fusionInYpoint1 < fusionOutYpoint1 ? fiberIn : fiberOut,
      toY: fusionYpoint1,
    });

    const secondPath = this.getPathForFiberConnection({
      fiber: fusionInYpoint1 < fusionOutYpoint1 ? fiberOut : fiberIn,
      toY: fusionYpoint3,
    });

    const firstSegment = getUnitsForPath({
      unitSize: Config.baseUnits.fiber.height,
      path: firstPath,
      color: (fusionInYpoint1 < fusionOutYpoint1 ? fiberIn : fiberOut).color,
    });

    const secondSegment = getUnitsForPath({
      unitSize: Config.baseUnits.fiber.height,
      path: secondPath,
      color: (fusionInYpoint1 < fusionOutYpoint1 ? fiberOut : fiberIn).color,
    });

    return {
      legs: [
        ...firstSegment,
        ...secondSegment,
        ...centerUpperMiddleDot,
        ...centerLowerMiddleDot,
      ],
      center: fusionYpoint2,
    };
  }

  getPathForFiberConnection({ fiber, toY }: { fiber: Fiber; toY: number }) {
    const isLeftToRightConnection =
      fiber.parentTube.parentWire.disposition === "LEFT";
    const ourSideAngleSegments = isLeftToRightConnection
      ? this.parentGrid.leftSideAngleSegments
      : this.parentGrid.rightSideAngleSegments;

    const ourConnectionIndex = ourSideAngleSegments.findIndex(
      (segment) => segment.fiber_id === fiber.id
    );

    const numberOfPreviousAngles =
      ourConnectionIndex !== -1
        ? ourConnectionIndex
        : ourSideAngleSegments.length;

    const separation =
      Config.baseUnits.fiber.height * 2 +
      numberOfPreviousAngles * 2 * Config.baseUnits.fiber.height;

    let angleXpoint: number;
    let path = [];

    if (fiber.attr.position.y === toY) {
      if (isLeftToRightConnection) {
        for (
          let iX = fiber.attr.position.x;
          iX < this.parentGrid.leftSideWidth;
          iX += Config.baseUnits.fiber.height
        ) {
          path.push([iX, fiber.attr.position.y]);
        }
      } else {
        for (
          let iX = fiber.attr.position.x;
          iX >= this.parentGrid.leftSideWidth;
          iX -= Config.baseUnits.fiber.height
        ) {
          path.push([iX, fiber.attr.position.y]);
        }
      }

      this.parentGrid.setVerticalUsedIndexWithHeight({
        yPoint: fiber.attr.position.y,
        height: Config.baseUnits.fiber.height,
      });

      return path;
    }

    if (isLeftToRightConnection) {
      angleXpoint =
        this.parentGrid.leftSideWidth -
        (separation + Config.baseUnits.fiber.height);
    } else {
      angleXpoint = this.parentGrid.leftSideWidth + separation;
    }

    path = [[angleXpoint, fiber.attr.position.y]];

    // from: fiber.attr.position.x, fiber.attr.position.y
    // to: angleXpoint, fiber.attr.position.y
    if (isLeftToRightConnection) {
      for (
        let iX = fiber.attr.position.x;
        iX < angleXpoint;
        iX += Config.baseUnits.fiber.height
      ) {
        path.push([iX, fiber.attr.position.y]);
      }
    } else {
      for (
        let iX = fiber.attr.position.x;
        iX >= angleXpoint;
        iX -= Config.baseUnits.fiber.height
      ) {
        path.push([iX, fiber.attr.position.y]);
      }
    }

    // from: angleXpoint, fiber.attr.position.y
    // to: angleXpoint, toY
    if (fiber.attr.position.y < toY) {
      for (
        let iY = fiber.attr.position.y;
        iY < toY;
        iY += Config.baseUnits.fiber.height
      ) {
        path.push([angleXpoint, iY]);
      }
    } else {
      for (
        let iY = fiber.attr.position.y;
        iY > toY;
        iY -= Config.baseUnits.fiber.height
      ) {
        path.push([angleXpoint, iY]);
      }
    }

    // from: angleXpoint, toY
    // to: this.parentGrid.leftSideWidth, toY
    if (isLeftToRightConnection) {
      for (
        let iX = angleXpoint;
        iX < this.parentGrid.leftSideWidth;
        iX += Config.baseUnits.fiber.height
      ) {
        path.push([iX, toY]);
      }
    } else {
      for (
        let iX = angleXpoint;
        iX >= this.parentGrid.leftSideWidth;
        iX -= Config.baseUnits.fiber.height
      ) {
        path.push([iX, toY]);
      }
    }

    this.parentGrid.setVerticalUsedIndexWithHeight({
      yPoint: fiber.attr.position.y,
      height: Config.baseUnits.fiber.height,
    });

    this.parentGrid.setVerticalUsedIndexWithHeight({
      yPoint: toY,
      height: Config.baseUnits.fiber.height,
    });

    if (isLeftToRightConnection) {
      this.parentGrid.addLeftSideAngleSegment({
        fiber_id: fiber.id,
        toY,
      });
    } else {
      this.parentGrid.addRightSideAngleSegment({
        fiber_id: fiber.id,
        toY,
      });
    }

    return path;
  }

  remove() {
    this.parentGrid.removeFiberConnection(this);
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
