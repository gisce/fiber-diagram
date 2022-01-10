import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { Grid, Position } from "base/Grid";
import { pathIsHorizontal } from "utils/pathUtils";
import { FiberConnectionApiType, FiberConnectionDataType, LegType } from ".";

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
    const freeIndexes = this.parentGrid.getNFreeIndexesFromYpoint(
      fiberIn.attr.position.y,
      Config.baseUnits.fiber.height * 3
    );

    const fusionYpoint: number = freeIndexes[0];

    return {
      legs: [
        ...this.getUnitsForPath({
          path: this.getPathForFiberConnection({
            fiber: fiberIn,
            toY: fusionYpoint,
          }),
          color: fiberIn.color,
        }),
        ...this.getUnitsForPath({
          path: this.getPathForFiberConnection({
            fiber: fiberOut,
            toY: fusionYpoint,
          }),
          color: fiberOut.color,
        }),
      ],
      center: fusionYpoint,
    };
  }

  getSameSideLegs({ fiberIn, fiberOut }: { fiberIn: Fiber; fiberOut: Fiber }) {
    // First, we determine which two fusion point of the middle of the grid (connection place) is free
    const [fusionInYpoint1, fusionInYpoint2, fusionInYpoint3] =
      this.parentGrid.getNFreeIndexesFromYpoint(
        fiberIn.attr.position.y,
        Config.baseUnits.fiber.height * 3
      );

    const [fusionOutYpoint1, fusionOutYpoint2, fusionOutYpoint3] =
      this.parentGrid.getNFreeIndexesFromYpoint(
        fiberOut.attr.position.y,
        Config.baseUnits.fiber.height * 3
      );

    let fusionYpoint1: number, fusionYpoint2: number, fusionYpoint3: number;

    if (fusionInYpoint1 < fusionOutYpoint1) {
      fusionYpoint1 = fusionInYpoint1;
      fusionYpoint2 = fusionInYpoint2;
      fusionYpoint3 = fusionInYpoint3;
    } else {
      fusionYpoint1 = fusionOutYpoint1;
      fusionYpoint2 = fusionOutYpoint2;
      fusionYpoint3 = fusionOutYpoint3;
    }

    this.parentGrid.setVerticalUsedIndexWithHeight(
      fusionYpoint1,
      Config.baseUnits.fiber.height
    );
    this.parentGrid.setVerticalUsedIndexWithHeight(
      fusionYpoint2,
      Config.baseUnits.fiber.height
    );
    this.parentGrid.setVerticalUsedIndexWithHeight(
      fusionYpoint3,
      Config.baseUnits.fiber.height
    );

    const centerUpperMiddleDot = this.getUnitsForPath({
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

    const centerLowerMiddleDot = this.getUnitsForPath({
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

    const firstSegment = this.getUnitsForPath({
      path: firstPath,
      color: (fusionInYpoint1 < fusionOutYpoint1 ? fiberIn : fiberOut).color,
    });

    const secondSegment = this.getUnitsForPath({
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

      this.parentGrid.setVerticalUsedIndexWithHeight(
        fiber.attr.position.y,
        Config.baseUnits.fiber.height
      );

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

    this.parentGrid.setVerticalUsedIndexWithHeight(
      fiber.attr.position.y,
      Config.baseUnits.fiber.height
    );

    this.parentGrid.setVerticalUsedIndexWithHeight(
      toY,
      Config.baseUnits.fiber.height
    );

    if (pathIsHorizontal(path)) {
      return path;
    }

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

  getUnitsForPath({
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
          width: Config.baseUnits.fiber.height,
          height: Config.baseUnits.fiber.height,
        },
        color,
      };
    });
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
