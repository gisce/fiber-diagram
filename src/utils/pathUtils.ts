import { Config } from "@/base/Config";
import { PathUnit, Position } from "@/base/Grid/Grid.types";
import { RowController } from "@/base/PathController/RowController/RowController";

export const getUnitsForPath = ({
  pathCoords,
  color,
  unitSize,
}: {
  pathCoords: number[][];
  unitSize: number;
  color: string;
}): PathUnit[] => {
  return pathCoords.map((entry) => {
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

export const getNPointsBelowPoint = ({
  point,
  unitSize, // Will be the separation between the points returned
  n,
}: {
  point: number; // Origin point
  unitSize: number; // Will be the separation between the points returned
  n: number; // Number of points to be returned
}) => {
  return getNPoints({
    point,
    unitSize,
    n,
    place: "BELOW",
  });
};

export const getNPointsAbovePoint = ({
  point,
  unitSize,
  n,
}: {
  point: number; // Origin point
  unitSize: number; // Will be the separation between the points returned
  n: number; // Number of points to be returned
}) => {
  return getNPoints({
    point,
    unitSize,
    n,
    place: "ABOVE",
  });
};

export const getNPoints = ({
  point,
  unitSize,
  n,
  place,
}: {
  point: number; // Origin point
  unitSize: number; // Will be the separation between the points returned
  n: number; // Number of points to be returned
  place: "ABOVE" | "BELOW";
}) => {
  const indexes = [];

  for (let i = 0; i < n; i++) {
    indexes.push(point + i * unitSize * (place === "ABOVE" ? -1 : 1));
  }

  return indexes.sort(function (a, b) {
    return a - b;
  });
};

export const getLeftToPointPath = ({
  source,
  point,
  angleRowController,
  fusionYPoint,
  unitSize,
}: {
  source: Position; // The fiber on the left side
  point: number; // The X, as in, middle of the grid
  angleRowController: RowController; // In order to check where we can horizontally place our connection
  fusionYPoint: number; // The fusion point
  unitSize: number;
}) => {
  // If it's a flat path, we return it directly
  if (source.y === fusionYPoint) {
    return {
      path: getLeftToPointFlatPath({ source, point }),
    };
  }

  let path = [];

  // We determine the angle point searching horizontal available space inside angleRow
  const freeXPoints = angleRowController.indexController.getFreeBelowIndexes({
    point: point - unitSize * 2,
    unitSize,
    n: 1,
  });

  let freeXPoint: number;

  // If there's no space, we return points below the minimum
  if (!freeXPoints || freeXPoints.length === 0) {
    freeXPoint = getNPointsBelowPoint({
      point: angleRowController.indexController.getLowestUsedIndex(),
      unitSize,
      n: 1,
    })[0];
  } else {
    freeXPoint = freeXPoints[0];
  }

  // from: source.x, source.y
  // to: freeXPoint, source.y
  for (let iX = source.x; iX < freeXPoint; iX += 1) {
    path.push([iX, source.y]);
  }

  // from: freeXPoint, source.y
  // to: freeXPoint, target.y
  if (source.y < fusionYPoint) {
    for (let iY = source.y; iY < fusionYPoint; iY += 1) {
      path.push([freeXPoint, iY]);
    }
  } else {
    for (let iY = source.y; iY > fusionYPoint; iY -= 1) {
      path.push([freeXPoint, iY]);
    }
  }

  // from: freeXPoint, toY
  // to: target.x, toY
  for (let iX = freeXPoint; iX < point; iX += 1) {
    path.push([iX, fusionYPoint]);
  }

  return {
    path,
    usedXPoint: freeXPoint,
    usedYPoint: source.y,
  };
};

export const getRightToPointPath = ({
  source,
  point,
  angleRowController,
  fusionYPoint,
  unitSize,
  minAngle,
}: {
  source: Position; // The fiber on the left side
  point: number; // The X, as in, middle of the grid
  angleRowController: RowController; // In order to check where we can horizontally place our connection
  fusionYPoint: number; // The fusion point
  unitSize: number;
  minAngle?: number;
}) => {
  // If it's a flat path, we return it directly
  if (source.y === fusionYPoint) {
    return {
      path: getRightToPointFlatPath({ target: source, point }),
    };
  }

  let path = [];

  // We determine the angle point searching horizontal available space inside angleRow
  const freeXPoint = angleRowController.indexController.getFreeAboveIndexes({
    point: minAngle ? minAngle + unitSize : point + unitSize,
    unitSize,
    n: 1,
  })[0];

  // from: source.x, source.y
  // to: freeXPoint, source.y
  for (let iX = source.x; iX >= freeXPoint; iX -= 1) {
    path.push([iX, source.y]);
  }

  // from: freeXPoint, source.y
  // to: freeXPoint, target.y
  if (source.y < fusionYPoint) {
    for (let iY = source.y; iY < fusionYPoint; iY += 1) {
      path.push([freeXPoint, iY]);
    }
  } else {
    for (let iY = source.y; iY > fusionYPoint; iY -= 1) {
      path.push([freeXPoint, iY]);
    }
  }

  // from: freeXPoint, toY
  // to: target.x, toY
  for (let iX = freeXPoint; iX >= point; iX -= 1) {
    path.push([iX, fusionYPoint]);
  }

  return {
    path,
    usedXPoint: freeXPoint,
    usedYPoint: source.y,
  };
};

export const getLeftToPointFlatPath = ({
  source,
  point,
}: {
  source: Position; // The fiber on the left side
  point: number; // The X, as in, middle of the grid
}) => {
  let path = [];

  for (let iX = source.x; iX < point; iX += 1) {
    path.push([iX, source.y]);
  }

  return path;
};

export const getRightToPointFlatPath = ({
  target,
  point,
}: {
  target: Position; // The fiber on the left side
  point: number; // The X, as in, middle of the grid
}) => {
  let path = [];

  for (let iX = point; iX < target.x; iX += 1) {
    path.push([iX, target.y]);
  }

  return path;
};
