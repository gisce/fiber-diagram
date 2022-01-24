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

  // And we set now this point as used index in the fusion column
  columnController.indexController.setUsedIndexWithSize({
    point: fusionYPoint,
    size: Config.baseUnits.fiber.height,
    element: fiberIn,
  });

  // Check if we can directly connect the fibers if they're flat and there's space in the middle fusion column
  if (source.y === target.y && target.y === fusionYPoint) {
    return getFiberToFiberFlatPath({
      fiberIn,
      fiberOut,
      fusionYPoint,
      columnController,
    });
  }

  // If the fibers are not flat, we get our left and right paths separately
  const leftLeg = getLeftLeg({
    fiberIn,
    columnController,
    angleRowController: leftAngleRowController,
    fusionYPoint,
  });

  const rightLeg = getRightLeg({
    fiberOut,
    columnController,
    angleRowController: rightAngleRowController,
    fusionYPoint,
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
  // If it's a flat path, we return it directly
  if (source.y === fusionYPoint) {
    return {
      path: getLeftToMiddleFlatPath({ source, columnController }),
    };
  }

  let path = [];

  // We determine the angle point searching horizontal available space inside angleRow
  const freeXPoint = angleRowController.indexController.getFreeBelowIndexes({
    point: columnController.middlePoint - Config.separation * 2,
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

  return {
    path,
    usedXPoint: freeXPoint,
    usedYPoint: source.y,
  };
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
  // If it's a flat path, we return it directly
  if (source.y === fusionYPoint) {
    return {
      path: getRightToMiddleFlatPath({ target: source, columnController }),
    };
  }

  let path = [];

  // We determine the angle point searching horizontal available space inside angleRow
  const freeXPoint = angleRowController.indexController.getFreeAboveIndexes({
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

  return {
    path,
    usedXPoint: freeXPoint,
    usedYPoint: source.y,
  };
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

const getFiberToFiberFlatPath = ({
  fiberIn,
  fiberOut,
  columnController,
  fusionYPoint,
}: {
  fiberIn: Fiber; // The fiber on the left side
  fiberOut: Fiber; // The fiber on the right side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  fusionYPoint: number;
}) => {
  const leftPath = getLeftToMiddleFlatPath({
    source: fiberIn.attr.position,
    columnController,
  });
  const leftLeg = getUnitsForPath({
    pathCoords: leftPath,
    color: fiberIn.color,
    unitSize: Config.baseUnits.fiber.height,
  });

  const rightPath = getRightToMiddleFlatPath({
    target: fiberOut.attr.position,
    columnController,
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

const getLeftLeg = ({
  fiberIn,
  columnController,
  fusionYPoint,
  angleRowController,
}: {
  fiberIn: Fiber; // The fiber on the left side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  angleRowController: RowController; // In order to check where we can horizontally place our connection
  fusionYPoint: number;
}) => {
  const {
    path: leftPath,
    usedXPoint: leftUsedXPoint,
    usedYPoint: leftUsedYPoint,
  } = getLeftToMiddlePath({
    source: fiberIn.attr.position,
    columnController,
    angleRowController,
    fusionYPoint,
  });

  if (leftUsedXPoint) {
    // We set now the used indexes in the angleRow
    angleRowController.indexController.setUsedIndexWithSize({
      point: leftUsedXPoint,
      size: Config.baseUnits.fiber.height,
      element: fiberIn,
    });
  }

  if (leftUsedYPoint) {
    columnController.indexController.setUsedIndexWithSize({
      point: leftUsedYPoint,
      size: Config.baseUnits.fiber.height,
      element: fiberIn,
    });
  }

  return getUnitsForPath({
    pathCoords: leftPath,
    color: fiberIn.color,
    unitSize: Config.baseUnits.fiber.height,
  });
};

const getRightLeg = ({
  fiberOut,
  columnController,
  fusionYPoint,
  angleRowController,
}: {
  fiberOut: Fiber; // The fiber on the right side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  angleRowController: RowController; // In order to check where we can horizontally place our connection
  fusionYPoint: number;
}) => {
  const {
    path: rightPath,
    usedXPoint: rightUsedXPoint,
    usedYPoint: rightUsedYPoint,
  } = getRightToMiddlePath({
    source: fiberOut.attr.position,
    columnController,
    angleRowController,
    fusionYPoint,
  });

  if (rightUsedXPoint) {
    // We set now the used indexes in the angleRow
    angleRowController.indexController.setUsedIndexWithSize({
      point: rightUsedXPoint,
      size: Config.baseUnits.fiber.height,
      element: fiberOut,
    });
  }

  if (rightUsedYPoint) {
    columnController.indexController.setUsedIndexWithSize({
      point: rightUsedYPoint,
      size: Config.baseUnits.fiber.height,
      element: fiberOut,
    });
  }

  return getUnitsForPath({
    pathCoords: rightPath,
    color: fiberOut.color,
    unitSize: Config.baseUnits.fiber.height,
  });
};
