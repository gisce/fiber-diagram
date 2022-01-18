import { Config } from "base/Config";
import { Tube } from "base/Tube";
import { Grid, LegType, Position, VerticalIndexElement } from "base/Grid";
import { TubeConnectionApiType, TubeConnectionDataType } from ".";
import { getPathForConnection, getUnitsForPath } from "utils/pathUtils";

export class TubeConnection {
  tube_in: number;
  tube_out: number;
  parentGrid: Grid;
  legs: LegType[] = [];
  center: Position = {
    x: 0,
    y: 0,
  };
  usedYpoints: { [key: number]: VerticalIndexElement } = {};
  onInitializeDone?: (connection: TubeConnection) => void;

  constructor({
    data,
    parentGrid,
    onInitializeDone,
  }: {
    data: TubeConnectionDataType;
    parentGrid: Grid;
    onInitializeDone?: (connection: TubeConnection) => void;
  }) {
    const { tube_in, tube_out } = data;
    this.tube_in = tube_in;
    this.tube_out = tube_out;
    this.parentGrid = parentGrid;
    this.onInitializeDone = onInitializeDone;
    this.calculatePositionSize();
  }

  calculatePositionSize() {
    const tubeIn: Tube | undefined = this.parentGrid.getTubeById(this.tube_in);

    const tubeOut: Tube | undefined = this.parentGrid.getTubeById(
      this.tube_out
    );

    if (!tubeIn) {
      this.onInitializeDone?.(this);
      return;
      // TODO: throw error when splitters are implemented.
      // throw `Tube with id ${this.tube_in} not found`;
    }

    if (!tubeOut) {
      this.onInitializeDone?.(this);
      return;
      // TODO: throw error when splitters are implemented.
      // throw `Tube with id ${this.tube_out} not found`;
    }

    if (tubeIn.expanded) {
      this.onInitializeDone?.(this);
      return;
    }

    const getLegsFn =
      tubeIn.parentWire.disposition === tubeOut.parentWire.disposition
        ? this.getSameSideLegs.bind(this)
        : this.getLeftToRightLegs.bind(this);

    const { legs, center } = getLegsFn({
      tubeIn,
      tubeOut,
    });

    this.legs = [...legs];

    this.center = {
      x: this.parentGrid.leftSideWidth,
      y: center,
    };

    this.onInitializeDone?.(this);
  }

  getLeftToRightLegs({ tubeIn, tubeOut }: { tubeIn: Tube; tubeOut: Tube }) {
    // First, we determine which fusion point of the middle of the grid (connection place) is free
    const { modifiedHeight, freeIndexes } =
      this.parentGrid.getNFreeIndexesFromYpoint({
        unitSize: Config.baseUnits.tube.height,
        n: 3,
        fromY: tubeIn.attr.position.y,
      });

    if (modifiedHeight) {
      this.parentGrid.size.height = modifiedHeight;
    }

    const fusionYpoint: number = freeIndexes[0];

    return {
      legs: [
        ...getUnitsForPath({
          path: getPathForConnection({
            source: tubeIn.attr.position,
            disposition: tubeIn.parentWire.disposition,
            element_id: tubeIn.id,
            target: {
              x: tubeIn.parentWire.parentGrid.leftSideWidth,
              y: fusionYpoint,
            },
            type: "tube",
            grid: this.parentGrid,
          }),
          color: tubeIn.color,
          unitSize: Config.baseUnits.tube.height,
        }),
        ...getUnitsForPath({
          path: getPathForConnection({
            source: tubeOut.attr.position,
            target: {
              x: tubeOut.parentWire.parentGrid.leftSideWidth,
              y: fusionYpoint,
            },
            grid: this.parentGrid,
            type: "tube",
            element_id: tubeOut.id,
            disposition: tubeOut.parentWire.disposition,
          }),
          color: tubeOut.color,
          unitSize: Config.baseUnits.tube.height,
        }),
      ],
      center: fusionYpoint,
    };
  }

  getSameSideLegs({ tubeIn, tubeOut }: { tubeIn: Tube; tubeOut: Tube }) {
    let modifiedHeight: number | undefined;

    // First, we determine which two fusion point of the middle of the grid (connection place) is free
    const { modifiedHeight: inModifiedHeight, freeIndexes: inFreeIndexes } =
      this.parentGrid.getNFreeIndexesFromYpoint({
        unitSize: Config.baseUnits.tube.height,
        n: 3,
        fromY: tubeIn.attr.position.y,
      });

    const [fusionInYpoint1, fusionInYpoint2, fusionInYpoint3] = inFreeIndexes;

    const { modifiedHeight: outModifiedHeight, freeIndexes: outFreeIndexes } =
      this.parentGrid.getNFreeIndexesFromYpoint({
        unitSize: Config.baseUnits.tube.height,
        n: 3,
        fromY: tubeOut.attr.position.y,
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
      height: Config.baseUnits.tube.height,
      element: {
        type: "tube",
        id: tubeIn.id,
      },
    });

    this.parentGrid.setVerticalUsedIndexWithHeight({
      yPoint: fusionYpoint2,
      height: Config.baseUnits.tube.height,
      element: {
        type: "tube",
        id: tubeIn.id,
      },
    });

    this.parentGrid.setVerticalUsedIndexWithHeight({
      yPoint: fusionYpoint3,
      height: Config.baseUnits.tube.height,
      element: {
        type: "tube",
        id: tubeIn.id,
      },
    });

    const centerUpperMiddleDot = getUnitsForPath({
      unitSize: Config.baseUnits.tube.height,
      color: fusionInYpoint1 < fusionOutYpoint1 ? tubeIn.color : tubeOut.color,
      path: [
        [
          this.parentGrid.leftSideWidth - Config.baseUnits.tube.height / 2,
          fusionYpoint1,
        ],
        [
          this.parentGrid.leftSideWidth - Config.baseUnits.tube.height / 2,
          fusionYpoint2,
        ],
      ],
    });

    const centerLowerMiddleDot = getUnitsForPath({
      unitSize: Config.baseUnits.tube.height,
      color: fusionInYpoint1 < fusionOutYpoint1 ? tubeOut.color : tubeIn.color,
      path: [
        [
          this.parentGrid.leftSideWidth - Config.baseUnits.tube.height / 2,
          fusionYpoint3,
        ],
      ],
    });

    const firstTube = fusionInYpoint1 < fusionOutYpoint1 ? tubeIn : tubeOut;
    const firstPath = getPathForConnection({
      source: firstTube.attr.position,
      element_id: firstTube.id,
      disposition: firstTube.parentWire.disposition,
      type: "tube",
      grid: this.parentGrid,
      target: {
        x: firstTube.parentWire.parentGrid.leftSideWidth,
        y: fusionYpoint1,
      },
    });

    const secondTube = fusionInYpoint1 < fusionOutYpoint1 ? tubeOut : tubeIn;

    const secondPath = getPathForConnection({
      source: secondTube.attr.position,
      disposition: secondTube.parentWire.disposition,
      element_id: secondTube.id,
      grid: this.parentGrid,
      type: "tube",
      target: {
        x: secondTube.parentWire.parentGrid.leftSideWidth,
        y: fusionYpoint3,
      },
    });

    const firstSegment = getUnitsForPath({
      unitSize: Config.baseUnits.tube.height,
      path: firstPath,
      color: (fusionInYpoint1 < fusionOutYpoint1 ? tubeIn : tubeOut).color,
    });

    const secondSegment = getUnitsForPath({
      unitSize: Config.baseUnits.tube.height,
      path: secondPath,
      color: (fusionInYpoint1 < fusionOutYpoint1 ? tubeOut : tubeIn).color,
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

  getApiJson(): TubeConnectionApiType {
    const { tube_in, tube_out } = this;
    return {
      tube_in,
      tube_out,
    };
  }

  getJson(): TubeConnectionDataType {
    const { tube_in, tube_out } = this;
    return {
      tube_in,
      tube_out,
    };
  }
}
