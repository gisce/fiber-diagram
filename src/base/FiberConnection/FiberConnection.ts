import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { Grid, LegType, Position } from "base/Grid";
import { getPathForConnection, getUnitsForPath } from "utils/pathUtils";
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

    if (fiberIn.parentTube && !fiberIn.parentTube.expanded) {
      return;
    }

    if (fiberIn.parentTube === undefined || fiberOut.parentTube === undefined) {
      const s2s =
        fiberIn.parentTube === undefined && fiberOut.parentTube === undefined; // splitter to splitter connection

      const getLegsFn = s2s
        ? this.getSplitterToSplitterLegs.bind(this)
        : this.getLeftToRightLegsSplitter.bind(this);

      const { legs, center } = getLegsFn({
        fiberIn,
        fiberOut,
      });

      this.legs = [...legs];

      this.center = center;
    } else {
      const getLegsFn =
        fiberIn.parentTube &&
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
    }
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
        n: 1,
        fromY: fiberIn.attr.position.y,
      });

    if (modifiedHeight) {
      this.parentGrid.size.height = modifiedHeight;
    }

    const fusionYpoint: number = freeIndexes[0];

    return {
      legs: [
        ...getUnitsForPath({
          path: getPathForConnection({
            source: fiberIn.attr.position,
            disposition: fiberIn.parentTube.parentWire.disposition,
            element_id: fiberIn.id,
            target: {
              x: fiberIn.parentTube.parentWire.parentGrid.leftSideWidth,
              y: fusionYpoint,
            },
            type: "fiber",
            grid: this.parentGrid,
          }),
          color: fiberIn.color,
          unitSize: Config.baseUnits.fiber.height,
        }),
        ...getUnitsForPath({
          path: getPathForConnection({
            source: fiberOut.attr.position,
            target: {
              x: fiberOut.parentTube.parentWire.parentGrid.leftSideWidth,
              y: fusionYpoint,
            },
            grid: this.parentGrid,
            type: "fiber",
            element_id: fiberOut.id,
            disposition: fiberOut.parentTube.parentWire.disposition,
          }),
          color: fiberOut.color,
          unitSize: Config.baseUnits.fiber.height,
        }),
      ],
      center: fusionYpoint,
    };
  }

  getLeftToRightLegsSplitter({
    fiberIn,
    fiberOut,
  }: {
    fiberIn: Fiber;
    fiberOut: Fiber;
  }) {
    // First, we determine which of the fibers is which one
    const tubeFiber = fiberIn.parentTube !== undefined ? fiberIn : fiberOut;
    const splitterFibber =
      fiberIn.parentTube !== undefined ? fiberOut : fiberIn;

    const connectionSide = tubeFiber.parentTube.parentWire.disposition;

    const increase =
      splitterFibber.splitterFiberSide === connectionSide &&
      connectionSide === "RIGHT"
        ? Config.baseUnits.fiber.width
        : 0;

    return {
      legs: [
        ...getUnitsForPath({
          path: getPathForConnection({
            source: tubeFiber.attr.position,
            disposition: connectionSide,
            element_id: tubeFiber.id,
            target: {
              x: splitterFibber.attr.position.x + increase,
              y: splitterFibber.attr.position.y,
            },
            type: "fiber",
            grid: this.parentGrid,
          }),
          color: tubeFiber.color,
          unitSize: Config.baseUnits.fiber.height,
        }),
      ],
      center: {
        x: splitterFibber.attr.position.x + increase,
        y: splitterFibber.attr.position.y,
      },
    };
  }

  getSplitterToSplitterLegs({
    fiberIn,
    fiberOut,
  }: {
    fiberIn: Fiber;
    fiberOut: Fiber;
  }) {
    const fiberInIsInput =
      fiberIn.parentSplitter.fibersIn.find((fiber) => {
        fiber.id === fiberIn.id;
      }) !== undefined;

    const fiberInput = fiberInIsInput ? fiberIn : fiberOut;
    const fiberOutput = fiberInIsInput ? fiberOut : fiberIn;

    return {
      legs: [
        // ...getUnitsForPath({
        //   path: getPathForConnection({
        //     source: fiberOutput.attr.position,
        //     disposition: "RIGHT",
        //     element_id: fiberOutput.id,
        //     target: {
        //       x: fiberInput.attr.position.x + Config.baseUnits.fiber.width,
        //       y: fiberInput.attr.position.y,
        //     },
        //     type: "fiber",
        //     grid: this.parentGrid,
        //   }),
        //   color: fiberInput.color,
        //   unitSize: Config.baseUnits.fiber.height,
        // }),
      ],
      center: {
        x: fiberOutput.attr.position.x + Config.baseUnits.fiber.width,
        y: fiberOutput.attr.position.y,
      },
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
      element: {
        type: "fiber",
        id: fiberIn.id,
      },
    });
    this.parentGrid.setVerticalUsedIndexWithHeight({
      yPoint: fusionYpoint2,
      height: Config.baseUnits.fiber.height,
      element: {
        type: "fiber",
        id: fiberIn.id,
      },
    });
    this.parentGrid.setVerticalUsedIndexWithHeight({
      yPoint: fusionYpoint3,
      height: Config.baseUnits.fiber.height,
      element: {
        type: "fiber",
        id: fiberIn.id,
      },
    });

    let firstFiber: Fiber;
    let secondFiber: Fiber;

    if (fusionInYpoint1 === fiberIn.attr.position.y) {
      firstFiber = fiberIn;
    }

    if (fusionYpoint3 === fiberIn.attr.position.y) {
      secondFiber = fiberIn;
    }

    if (fusionInYpoint1 === fiberOut.attr.position.y) {
      firstFiber = fiberOut;
    }

    if (fusionYpoint3 === fiberOut.attr.position.y) {
      secondFiber = fiberOut;
    }

    if (!firstFiber) {
      if (!secondFiber) {
        firstFiber = fusionInYpoint1 < fusionOutYpoint1 ? fiberIn : fiberOut;
      } else if (secondFiber === fiberIn) {
        firstFiber = fiberOut;
      } else if (secondFiber === fiberOut) {
        firstFiber = fiberIn;
      }
    }

    if (!secondFiber) {
      if (!firstFiber) {
        secondFiber = fusionInYpoint1 < fusionOutYpoint1 ? fiberOut : fiberIn;
      } else if (firstFiber === fiberIn) {
        secondFiber = fiberOut;
      } else if (firstFiber === fiberOut) {
        secondFiber = fiberIn;
      }
    }

    const centerUpperMiddleDot = getUnitsForPath({
      unitSize: Config.baseUnits.fiber.height,
      color: firstFiber.color,
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
      color: secondFiber.color,
      path: [
        [
          this.parentGrid.leftSideWidth - Config.baseUnits.fiber.height / 2,
          fusionYpoint3,
        ],
      ],
    });
    const firstPath = getPathForConnection({
      source: firstFiber.attr.position,
      element_id: firstFiber.id,
      disposition: firstFiber.parentTube.parentWire.disposition,
      type: "fiber",
      grid: this.parentGrid,
      target: {
        x: firstFiber.parentTube.parentWire.parentGrid.leftSideWidth,
        y: fusionYpoint1,
      },
    });

    const secondPath = getPathForConnection({
      source: secondFiber.attr.position,
      disposition: secondFiber.parentTube.parentWire.disposition,
      element_id: secondFiber.id,
      grid: this.parentGrid,
      type: "fiber",
      target: {
        x: secondFiber.parentTube.parentWire.parentGrid.leftSideWidth,
        y: fusionYpoint3,
      },
    });

    const firstSegment = getUnitsForPath({
      unitSize: Config.baseUnits.fiber.height,
      path: firstPath,
      color: firstFiber.color,
    });

    const secondSegment = getUnitsForPath({
      unitSize: Config.baseUnits.fiber.height,
      path: secondPath,
      color: secondFiber.color,
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
