import { Config } from "base/Config";
import { Tube } from "base/Tube";
import { Grid, Position } from "base/Grid";
import { pathIsHorizontal } from "utils/pathUtils";
import { TubeConnectionApiType, TubeConnectionDataType, LegType } from ".";

export class TubeConnection {
  tube_in: number;
  tube_out: number;
  parentGrid: Grid;
  legs: LegType[] = [];
  center: Position = {
    x: 0,
    y: 0,
  };
  usedYpoints: { [key: number]: boolean } = {};
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
    let fusionYpoint: number;

    if (
      (this.parentGrid.verticalUsedIndexes[tubeIn.attr.position.y] ===
        undefined ||
        this.parentGrid.verticalUsedIndexes[tubeIn.attr.position.y] ===
          false) &&
      (this.parentGrid.verticalUsedIndexes[tubeOut.attr.position.y] ===
        undefined ||
        this.parentGrid.verticalUsedIndexes[tubeOut.attr.position.y] === false)
    ) {
      fusionYpoint = tubeIn.attr.position.y;
    } else {
      fusionYpoint = this.parentGrid.getFirstFreeIndexFromYpoint(
        tubeIn.attr.position.y
      );
    }

    return {
      legs: [
        ...this.getUnitsForPath({
          path: this.getPathForTubeConnection({
            tube: tubeIn,
            toY: fusionYpoint,
          }),
          color: tubeIn.color,
        }),
        ...this.getUnitsForPath({
          path: this.getPathForTubeConnection({
            tube: tubeOut,
            toY: fusionYpoint,
          }),
          color: tubeOut.color,
        }),
      ],
      center: fusionYpoint,
    };
  }

  getSameSideLegs({ tubeIn, tubeOut }: { tubeIn: Tube; tubeOut: Tube }) {
    // First, we determine which two fusion point of the middle of the grid (connection place) is free
    const [fusionInYpoint1, fusionInYpoint2, fusionInYpoint3] =
      this.parentGrid.getFirstThreeFreeIndexesFromYpoint(
        tubeIn.attr.position.y
      );
    const [fusionOutYpoint1, fusionOutYpoint2, fusionOutYpoint3] =
      this.parentGrid.getFirstThreeFreeIndexesFromYpoint(
        tubeOut.attr.position.y
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

    this.parentGrid.setVerticalUsedIndex(fusionYpoint1);
    this.parentGrid.setVerticalUsedIndex(fusionYpoint2);
    this.parentGrid.setVerticalUsedIndex(fusionYpoint3);

    const centerUpperMiddleDot = this.getUnitsForPath({
      color: fusionInYpoint1 < fusionOutYpoint1 ? tubeIn.color : tubeOut.color,
      path: [
        [this.parentGrid.leftSideWidth - 0.5, fusionYpoint1],
        [this.parentGrid.leftSideWidth - 0.5, fusionYpoint2],
      ],
    });

    const centerLowerMiddleDot = this.getUnitsForPath({
      color: fusionInYpoint1 < fusionOutYpoint1 ? tubeOut.color : tubeIn.color,
      path: [[this.parentGrid.leftSideWidth - 0.5, fusionYpoint3]],
    });

    const firstPath = this.getPathForTubeConnection({
      tube: fusionInYpoint1 < fusionOutYpoint1 ? tubeIn : tubeOut,
      toY: fusionYpoint1,
    });

    const secondPath = this.getPathForTubeConnection({
      tube: fusionInYpoint1 < fusionOutYpoint1 ? tubeOut : tubeIn,
      toY: fusionYpoint3,
    });

    const firstSegment = this.getUnitsForPath({
      path: firstPath,
      color: (fusionInYpoint1 < fusionOutYpoint1 ? tubeIn : tubeOut).color,
    });

    const secondSegment = this.getUnitsForPath({
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

  getPathForTubeConnection({ tube, toY }: { tube: Tube; toY: number }) {
    const isLeftToRightConnection = tube.parentWire.disposition === "LEFT";
    const ourSideAngleSegments = isLeftToRightConnection
      ? this.parentGrid.leftSideAngleSegments
      : this.parentGrid.rightSideAngleSegments;

    // const ourConnectionIndex = ourSideAngleSegments.findIndex(
    //   (segment) => segment.tube_id === tube.id
    // );

    // const numberOfPreviousAngles =
    //   ourConnectionIndex !== -1
    //     ? ourConnectionIndex
    //     : ourSideAngleSegments.length;

    const numberOfPreviousAngles = ourSideAngleSegments.length;

    const separation =
      Config.baseUnits.tube.height * 2 +
      numberOfPreviousAngles * 2 * Config.baseUnits.tube.height;

    let angleXpoint: number;
    let path = [];

    if (tube.attr.position.y === toY) {
      if (isLeftToRightConnection) {
        for (
          let iX = tube.attr.position.x;
          iX < this.parentGrid.leftSideWidth;
          iX += Config.baseUnits.tube.height
        ) {
          path.push([iX, tube.attr.position.y]);
        }
      } else {
        for (
          let iX = tube.attr.position.x;
          iX >= this.parentGrid.leftSideWidth;
          iX -= Config.baseUnits.tube.height
        ) {
          path.push([iX, tube.attr.position.y]);
        }
      }

      this.parentGrid.setVerticalUsedIndex(tube.attr.position.y);

      return path;
    }

    if (isLeftToRightConnection) {
      angleXpoint =
        this.parentGrid.leftSideWidth -
        (separation + Config.baseUnits.tube.height);
    } else {
      angleXpoint = this.parentGrid.leftSideWidth + separation;
    }

    path = [[angleXpoint, tube.attr.position.y]];

    // from: tube.attr.position.x, tube.attr.position.y
    // to: angleXpoint, tube.attr.position.y
    if (isLeftToRightConnection) {
      for (
        let iX = tube.attr.position.x;
        iX < angleXpoint;
        iX += Config.baseUnits.tube.height
      ) {
        path.push([iX, tube.attr.position.y]);
      }
    } else {
      for (
        let iX = tube.attr.position.x;
        iX >= angleXpoint;
        iX -= Config.baseUnits.tube.height
      ) {
        path.push([iX, tube.attr.position.y]);
      }
    }

    // from: angleXpoint, tube.attr.position.y
    // to: angleXpoint, toY
    if (tube.attr.position.y < toY) {
      for (
        let iY = tube.attr.position.y;
        iY < toY;
        iY += Config.baseUnits.tube.height
      ) {
        path.push([angleXpoint, iY]);
      }
    } else {
      for (
        let iY = tube.attr.position.y;
        iY > toY;
        iY -= Config.baseUnits.tube.height
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
        iX += Config.baseUnits.tube.height
      ) {
        path.push([iX, toY]);
      }
    } else {
      for (
        let iX = angleXpoint;
        iX >= this.parentGrid.leftSideWidth;
        iX -= Config.baseUnits.tube.height
      ) {
        path.push([iX, toY]);
      }
    }

    this.parentGrid.setVerticalUsedIndex(tube.attr.position.y);
    this.parentGrid.setVerticalUsedIndex(toY);

    if (pathIsHorizontal(path)) {
      return path;
    }

    // if (isLeftToRightConnection) {
    //   this.parentGrid.addLeftSideAngleSegment({
    //     tube_id: tube.id,
    //     toY,
    //   });
    // } else {
    //   this.parentGrid.addRightSideAngleSegment({
    //     tube_id: tube.id,
    //     toY,
    //   });
    // }

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
          width: Config.baseUnits.tube.height,
          height: Config.baseUnits.tube.height,
        },
        color,
      };
    });
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
