import { Config } from "base/Config";
export type Columns = { [key: number]: boolean };
export type Grid = { [key: number]: Columns };

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
  n,
}: {
  fromY: number;
  n: number;
}) => {
  const indexes = [];
  for (let i = 0; i < n; i++) {
    indexes.push(fromY + i);
  }
  return indexes;
};

export const getNPointsAboveYpoint = ({
  fromY,
  n,
}: {
  fromY: number;
  n: number;
}) => {
  const indexes = [];
  for (let i = 0; i < n; i++) {
    indexes.push(fromY - i);
  }
  return indexes;
};

export const checkIfIndexIsFree = ({
  index,
  columns,
  height,
}: {
  index: number;
  columns: Columns;
  height: number;
}) => {
  return (
    (columns[index] === false || columns[index] === undefined) && index < height
  );
};

export const getNFreeIndexesFromYpoint = ({
  columns,
  n,
  fromY,
  height,
}: {
  n: number; // Number of units to check
  fromY: number; // Y point to start from
  columns: Columns; // Columns to check
  height: number; // Max height of the grid
}) => {
  let freeAboveIndexes: number[];
  let freeBelowIndexes: number[];

  // First, we check if for free units *BELOW* the y point, and store them in freeAboveIndexes
  for (let i = fromY; i < height; i++) {
    const indexes = getNPointsBelowYpoint({
      fromY: i,
      n,
    });

    const indexesAreFree = indexes.every((index) => {
      return checkIfIndexIsFree({
        index,
        columns,
        height,
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
      n,
    });
    const indexesAreFree = indexes.every((index) => {
      return checkIfIndexIsFree({
        index,
        columns,
        height,
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
      modifiedHeight: height + 2 + n,
      freeIndexes: getNPointsAboveYpoint({
        fromY: height,
        n,
      }),
    };
  }

  // TODO: find betwheen freeAboveIndexes and freeBelowIndexes the indexes which are closest to fromY
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
