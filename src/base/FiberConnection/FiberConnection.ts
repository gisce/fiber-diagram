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
            toY: fusionYpoint,
            type: "fiber",
            grid: this.parentGrid,
          }),
          color: fiberIn.color,
          unitSize: Config.baseUnits.fiber.height,
        }),
        ...getUnitsForPath({
          path: getPathForConnection({
            source: fiberOut.attr.position,
            toY: fusionYpoint,
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

    const firstFiber = fusionInYpoint1 < fusionOutYpoint1 ? fiberIn : fiberOut;
    const firstPath = getPathForConnection({
      source: firstFiber.attr.position,
      element_id: firstFiber.id,
      disposition: firstFiber.parentTube.parentWire.disposition,
      type: "fiber",
      grid: this.parentGrid,
      toY: fusionYpoint1,
    });

    const secondFiber = fusionInYpoint1 < fusionOutYpoint1 ? fiberOut : fiberIn;

    const secondPath = getPathForConnection({
      source: secondFiber.attr.position,
      disposition: secondFiber.parentTube.parentWire.disposition,
      element_id: secondFiber.id,
      grid: this.parentGrid,
      type: "fiber",
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
