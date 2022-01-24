import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { Position } from "base/Grid";
import { ColumnController } from "base/PathController/ColumnController/ColumnController";
import { RowController } from "base/PathController/RowController/RowController";
import { getUnitsForPath } from "utils/pathUtils";

export default ({
  fiberIn,
  fiberOut,
  columnController,
  leftAngleRowController,
  rightAngleRowController,
}: {
  fiberIn: Fiber; // The fiber on the left side
  fiberOut: Fiber; // The fiber on the right side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  leftAngleRowController: RowController; // In order to check where we can horizontally place our connection
  rightAngleRowController: RowController; // In order to check where we can horizontally place our connection
}) => {
  const source = fiberIn.attr.position;
  const target = fiberOut.attr.position;

  // First we determine the fusion point searching for the vertical available space inside fusionColumn
  const fusionYPoint =
    columnController.indexController.getNFreeIndexesFromPoint({
      point: source.y,
      unitSize: Config.baseUnits.fiber.height,
      n: 1,
    })[0];

  // Check if we can directly connect the fibers if they're flat and there's space in the middle fusion column
  if (source.y === target.y && target.y === fusionYPoint) {
    const leftPath = getLeftToMiddleFlatPath({ source, columnController });
    const leftLeg = getUnitsForPath({
      pathCoords: leftPath,
      color: fiberIn.color,
      unitSize: Config.baseUnits.fiber.height,
    });

    const rightPath = getRightToMiddleFlatPath({ target, columnController });
    const rightLeg = getUnitsForPath({
      pathCoords: rightPath,
      color: fiberOut.color,
      unitSize: Config.baseUnits.fiber.height,
    });

    return {
      fusionPoint: {
        x: columnController.middlePoint,
        y: fusionYPoint,
      },
      path: [...leftLeg, ...rightLeg],
    };
  }

  const leftPath = getLeftToMiddlePath({
    source,
    columnController,
    angleRowController: leftAngleRowController,
    fusionYPoint,
  });
  const leftLeg = getUnitsForPath({
    pathCoords: leftPath,
    color: fiberIn.color,
    unitSize: Config.baseUnits.fiber.height,
  });

  const rightPath = getRightToMiddlePath({
    source: target,
    columnController,
    angleRowController: rightAngleRowController,
    fusionYPoint,
  });
  const rightLeg = getUnitsForPath({
    pathCoords: rightPath,
    color: fiberOut.color,
    unitSize: Config.baseUnits.fiber.height,
  });

  return {
    fusionPoint: {
      x: columnController.middlePoint,
      y: fusionYPoint,
    },
    path: [...leftLeg, ...rightLeg],
  };
};

const getLeftToMiddlePath = ({
  source,
  columnController,
  angleRowController,
  fusionYPoint,
}: {
  source: Position; // The fiber on the left side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  angleRowController: RowController; // In order to check where we can horizontally place our connection
  fusionYPoint: number; // The fusion point
}) => {
  let path = [];

  // We determine the angle point searching horizontal available space inside angleRow
  const freeXPoint =
    angleRowController.indexController.getNFreeIndexesFromPoint({
      point: columnController.middlePoint - Config.separation,
      unitSize: Config.baseUnits.fiber.height,
      n: 1,
    })[0];

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
  for (let iX = freeXPoint; iX < columnController.middlePoint; iX += 1) {
    path.push([iX, fusionYPoint]);
  }

  return path;
};

const getRightToMiddlePath = ({
  source,
  columnController,
  angleRowController,
  fusionYPoint,
}: {
  source: Position; // The fiber on the left side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  angleRowController: RowController; // In order to check where we can horizontally place our connection
  fusionYPoint: number; // The fusion point
}) => {
  let path = [];

  // We determine the angle point searching horizontal available space inside angleRow
  const freeXPoint =
    angleRowController.indexController.getNFreeIndexesFromPoint({
      point: columnController.middlePoint + Config.separation,
      unitSize: Config.baseUnits.fiber.height,
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
  for (let iX = freeXPoint; iX >= columnController.middlePoint; iX -= 1) {
    path.push([iX, fusionYPoint]);
  }

  return path;
};

const getLeftToMiddleFlatPath = ({
  source,
  columnController,
}: {
  source: Position; // The fiber on the left side
  columnController: ColumnController; // In order to check where we can vertically place our connection
}) => {
  let path = [];

  for (let iX = source.x; iX < columnController.middlePoint; iX += 1) {
    path.push([iX, source.y]);
  }

  return path;
};

const getRightToMiddleFlatPath = ({
  target,
  columnController,
}: {
  target: Position; // The fiber on the left side
  columnController: ColumnController; // In order to check where we can vertically place our connection
}) => {
  let path = [];

  for (let iX = columnController.middlePoint; iX < target.x; iX += 1) {
    path.push([iX, target.y]);
  }

  return path;
};
