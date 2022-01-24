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
  // First we determine the fusion point searching for the vertical available space inside fusionColumn
  const fusionPoints = getFusionPoints({
    fiberIn,
    fiberOut,
    columnController,
  });

  // We set them as used in the fusion column
  fusionPoints.forEach((point) => {
    columnController.indexController.setUsedIndexWithSize({
      point,
      size: Config.baseUnits.fiber.height,
      element: fiberIn,
    });
  });

  // We determine which one will be the upper and lower fibers
  const { firstFiber, secondFiber } = getOrderedFibers({
    fiberIn,
    fiberOut,
  });

  // There'll be three points in the middle column:
  // first for fiberIn
  // second center point where the circle will be placed
  // third for fiberOut

  const centerUpperMiddleDot = getUnitsForPath({
    unitSize: Config.baseUnits.fiber.height,
    color: firstFiber.color,
    pathCoords: [
      [
        columnController.middlePoint - Config.baseUnits.fiber.height / 2,
        fusionPoints[0],
      ],
      [
        columnController.middlePoint - Config.baseUnits.fiber.height / 2,
        fusionPoints[1],
      ],
    ],
  });

  const lowerDot = getUnitsForPath({
    unitSize: Config.baseUnits.fiber.height,
    color: secondFiber.color,
    pathCoords: [
      [
        columnController.middlePoint - Config.baseUnits.fiber.height / 2,
        fusionPoints[2],
      ],
    ],
  });

  return {
    fusionPoint: {
      x: columnController.middlePoint,
      y: fusionPoints[1],
    },
    path: [...centerUpperMiddleDot, ...lowerDot],
  };
};

const getFusionPoints = ({
  fiberIn,
  fiberOut,
  columnController,
}: {
  fiberIn: Fiber;
  fiberOut: Fiber;
  columnController: ColumnController; // In order to check where we can vertically place our connection
}) => {
  const fusionInYPoints =
    columnController.indexController.getNFreeIndexesFromPoint({
      point: fiberIn.attr.position.y,
      unitSize: Config.baseUnits.fiber.height,
      n: 3,
    });

  const [fusionInYpoint1, fusionInYpoint2, fusionInYpoint3] = fusionInYPoints;

  const fusionOutYPoints =
    columnController.indexController.getNFreeIndexesFromPoint({
      point: fiberOut.attr.position.y,
      unitSize: Config.baseUnits.fiber.height,
      n: 3,
    });

  const [fusionOutYpoint1, fusionOutYpoint2, fusionOutYpoint3] =
    fusionOutYPoints;

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

  return [fusionYpoint1, fusionYpoint2, fusionYpoint3];
};

const getOrderedFibers = ({
  fiberIn,
  fiberOut,
}: {
  fiberIn: Fiber;
  fiberOut: Fiber;
}) => {
  const allFibers = [fiberIn, fiberOut];

  const sortedFibers = allFibers.sort((a: Fiber, b: Fiber) => {
    return a.attr.position.y - b.attr.position.y;
  });

  return {
    firstFiber: sortedFibers[0],
    secondFiber: sortedFibers[1],
  };
};
