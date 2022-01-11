import { Config } from "base/Config";
import { Grid, LegType, Position } from "base/Grid";

export type Columns = { [key: number]: boolean };

export const correctOverlap = (
  firstPath: number[][],
  secondPath: number[][],
  side: "LEFT" | "RIGHT"
) => {
  const correctedPath: number[][] = [];

  const vector = side === "LEFT" ? -1 : 1;

  secondPath.forEach((point: number[]) => {
    if (
      !checkIfPointIsInPath(point, firstPath) &&
      !checkIfPointIsInPath(
        [point[0] + vector * (Config.baseUnits.fiber.height * 1), point[1]],
        firstPath
      ) &&
      !checkIfPointIsInPath(
        [point[0] + vector * (Config.baseUnits.fiber.height * 2), point[1]],
        firstPath
      ) &&
      !checkIfPointIsInPath(
        [point[0] + vector * (Config.baseUnits.fiber.height * 3), point[1]],
        firstPath
      )
    ) {
      correctedPath.push(point);
    } else {
      correctedPath.push([point[0] - 3, point[1]]);
    }
  });

  return correctedPath;
};

export const checkIfPointIsInPath = (point: number[], path: number[][]) => {
  return path.some((pathPoint: number[]) => {
    return pathPoint[0] === point[0] && pathPoint[1] === point[1];
  });
};

export const pathIsHorizontal = (path: [number, number][]) => {
  const allYs = {};
  path.forEach((point) => (allYs[point[1]] = true));
  return Object.keys(allYs).length === 1;
};

export const getNPointsBelowYpoint = ({
  fromY,
  unitSize,
  n,
}: {
  fromY: number;
  unitSize: number;
  n: number;
}) => {
  const indexes = [];
  for (let i = 0; i < n; i++) {
    indexes.push(fromY + i * unitSize);
  }
  return indexes;
};

export const getNPointsAboveYpoint = ({
  fromY,
  unitSize,
  n,
}: {
  fromY: number;
  unitSize: number;
  n: number;
}) => {
  const indexes = [];
  for (let i = 0; i < n; i++) {
    indexes.push(fromY - i * unitSize);
  }
  return indexes;
};

export const checkIfIndexIsFree = ({
  index,
  columns,
  gridHeight,
}: {
  index: number;
  columns: Columns;
  gridHeight: number;
}) => {
  return (
    (columns[index] === false || columns[index] === undefined) &&
    index < gridHeight
  );
};

export const getNFreeIndexesFromYpoint = ({
  columns,
  unitSize,
  n,
  fromY,
  gridHeight,
}: {
  n: number; // Number of indexes to find
  unitSize: number; // Size of the unit
  fromY: number; // Y point to start from
  columns: Columns; // Columns to check
  gridHeight: number; // Max height of the grid
}) => {
  let freeAboveIndexes: number[];
  let freeBelowIndexes: number[];

  // First, we check if for free units *BELOW* the y point, and store them in freeAboveIndexes
  for (let i = fromY; i < gridHeight; i++) {
    const indexes = getNPointsBelowYpoint({
      fromY: i,
      unitSize,
      n,
    });

    const indexesAreFree = indexes.every((index) => {
      return checkIfIndexIsFree({
        index,
        columns,
        gridHeight,
      });
    });

    if (indexesAreFree) {
      freeAboveIndexes = indexes;
      break;
    }
  }

  // Next, we check for free units *ABOVE* the y point, and store them in freeBelowIndexes
  for (let j = fromY; j >= 0 + n; j--) {
    const indexes = getNPointsAboveYpoint({
      fromY: j,
      unitSize,
      n,
    });
    const indexesAreFree = indexes.every((index) => {
      return checkIfIndexIsFree({
        index,
        columns,
        gridHeight,
      });
    });
    if (indexesAreFree) {
      freeBelowIndexes = indexes;
      break;
    }
  }

  // If we couldn't find any free indexes above or below the yPoint, we just add more height, and place them below
  if (freeAboveIndexes === undefined && freeBelowIndexes === undefined) {
    return {
      modifiedHeight: gridHeight + n * unitSize,
      freeIndexes: getNPointsAboveYpoint({
        fromY: gridHeight,
        unitSize,
        n,
      }),
    };
  }

  if (freeAboveIndexes && freeBelowIndexes) {
    const firstPointAbove = freeAboveIndexes[0];
    const firstPointBelow = freeBelowIndexes[0];
    const distanceAbove = Math.abs(fromY - firstPointAbove);
    const distanceBelow = Math.abs(fromY - firstPointBelow);
    if (distanceAbove < distanceBelow) {
      return { freeIndexes: freeAboveIndexes };
    } else {
      return { freeIndexes: freeBelowIndexes };
    }
  }

  return { freeIndexes: freeAboveIndexes || freeBelowIndexes };
};

export const getUnitsForPath = ({
  path,
  color,
  unitSize,
}: {
  path: number[][];
  unitSize: number;
  color: string;
}): LegType[] => {
  return path.map((entry) => {
    return {
      position: {
        x: entry[0],
        y: entry[1],
      },
      size: {
        width: unitSize,
        height: unitSize,
      },
      color,
    };
  });
};

export const getPathForConnection = ({
  disposition,
  element_id,
  source,
  type,
  toY,
  grid,
}: {
  disposition: "LEFT" | "RIGHT";
  source: Position;
  element_id: number;
  type: "tube" | "fiber";
  toY: number;
  grid: Grid;
}) => {
  const unitSize = Config.baseUnits[type].height;

  const isLeftToRightConnection = disposition === "LEFT";
  const ourSideAngleSegments = isLeftToRightConnection
    ? grid.leftSideAngleSegments
    : grid.rightSideAngleSegments;

  const ourConnectionIndex = ourSideAngleSegments.findIndex(
    (segment) => segment.type === type && segment.element_id === element_id
  );

  const numberOfPreviousAngles =
    ourConnectionIndex !== -1
      ? ourConnectionIndex
      : ourSideAngleSegments.length;

  const separation = unitSize * 3 + numberOfPreviousAngles * 2 * unitSize;

  let angleXpoint: number;
  let path = [];

  if (source.y === toY) {
    if (isLeftToRightConnection) {
      for (let iX = source.x; iX < grid.leftSideWidth; iX += unitSize) {
        path.push([iX, source.y]);
      }
    } else {
      for (let iX = source.x; iX >= grid.leftSideWidth; iX -= unitSize) {
        path.push([iX, source.y]);
      }
    }

    grid.setVerticalUsedIndexWithHeight({
      yPoint: source.y,
      height: unitSize,
    });

    return path;
  }

  if (isLeftToRightConnection) {
    angleXpoint = grid.leftSideWidth - (separation + unitSize);
  } else {
    angleXpoint = grid.leftSideWidth + separation;
  }

  path = [[angleXpoint, source.y]];

  // from: source.x, source.y
  // to: angleXpoint, source.y
  if (isLeftToRightConnection) {
    for (let iX = source.x; iX < angleXpoint; iX += unitSize) {
      path.push([iX, source.y]);
    }
  } else {
    for (let iX = source.x; iX >= angleXpoint; iX -= unitSize) {
      path.push([iX, source.y]);
    }
  }

  // from: angleXpoint, source.y
  // to: angleXpoint, toY
  if (source.y < toY) {
    for (let iY = source.y; iY < toY; iY += unitSize) {
      path.push([angleXpoint, iY]);
    }
  } else {
    for (let iY = source.y; iY > toY; iY -= unitSize) {
      path.push([angleXpoint, iY]);
    }
  }

  // from: angleXpoint, toY
  // to: grid.leftSideWidth, toY
  if (isLeftToRightConnection) {
    for (let iX = angleXpoint; iX < grid.leftSideWidth; iX += unitSize) {
      path.push([iX, toY]);
    }
  } else {
    for (let iX = angleXpoint; iX >= grid.leftSideWidth; iX -= unitSize) {
      path.push([iX, toY]);
    }
  }

  grid.setVerticalUsedIndexWithHeight({
    yPoint: source.y,
    height: unitSize,
  });

  grid.setVerticalUsedIndexWithHeight({
    yPoint: toY,
    height: unitSize,
  });

  if (isLeftToRightConnection) {
    grid.addLeftSideAngleSegment({
      type,
      element_id,
      toY,
    });
  } else {
    grid.addRightSideAngleSegment({
      type,
      element_id,
      toY,
    });
  }

  return path;
};
