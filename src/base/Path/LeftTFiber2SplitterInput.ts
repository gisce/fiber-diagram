import { Config } from "@/base/Config";
import { Fiber } from "@/base/Fiber";
import { ColumnController } from "@/base/PathController/ColumnController/ColumnController";
import { RowController } from "@/base/PathController/RowController/RowController";
import { Tube } from "@/base/Tube";
import {
  getLeftToPointFlatPath,
  getLeftToPointPath,
  getRightToPointFlatPath,
  getUnitsForPath,
} from "@/utils/pathUtils";

export default ({
  elementIn,
  elementOut,
  columnController,
  leftAngleRowController,
  rightAngleRowController,
}: {
  elementIn: Fiber | Tube; // The fiber on the left side
  elementOut: Fiber | Tube; // The fiber on the right side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  leftAngleRowController: RowController; // In order to check where we can horizontally place our connection
  rightAngleRowController: RowController; // In order to check where we can horizontally place our connection
}) => {
  const source = elementIn.attr.position;
  const target = elementOut.attr.position;

  const type = elementIn instanceof Tube ? "tube" : "fiber";

  // First we determine the fusion point searching for the vertical available space inside fusionColumn
  const fusionYPoint = target.y;

  // And we set now this point as used index in the fusion column
  columnController.indexController.setUsedIndexWithSize({
    point: fusionYPoint,
    size: Config.baseUnits[type].height,
    element: elementIn,
  });

  // Check if we can directly connect the fibers if they're flat and there's space in the middle fusion column
  if (source.y === target.y && target.y === fusionYPoint) {
    return getFiberToFiberFlatPath({
      elementIn,
      elementOut,
      fusionYPoint,
      columnController,
    });
  }

  // If the fibers are not flat, we get our left and right paths separately
  const leftLeg = getLeftLeg({
    elementIn,
    columnController,
    angleRowController: leftAngleRowController,
    fusionYPoint,
  });

  let rightLeg = [];

  if (target.x > columnController.middlePoint) {
    // This means the fiber from the splitter is not placed on the middle, therefore we must draw a line to middlepoint
    rightLeg = getPendingLineToMiddle({
      element: elementOut as Fiber,
      fusionYPoint,
      middlePoint: columnController.middlePoint,
    });
  }

  return {
    fusionPoint: {
      x: columnController.middlePoint,
      y: fusionYPoint,
    },
    path: [...leftLeg, ...rightLeg],
  };
};

const getFiberToFiberFlatPath = ({
  elementIn,
  elementOut,
  columnController,
  fusionYPoint,
}: {
  elementIn: Fiber | Tube; // The fiber on the left side
  elementOut: Fiber | Tube; // The fiber on the right side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  fusionYPoint: number;
}) => {
  const type = elementIn instanceof Tube ? "tube" : "fiber";

  const leftPath = getLeftToPointFlatPath({
    source: elementIn.attr.position,
    point: columnController.middlePoint,
  });
  const leftLeg = getUnitsForPath({
    pathCoords: leftPath,
    color: elementIn.color,
    unitSize: Config.baseUnits[type].height,
  });

  const rightPath = getRightToPointFlatPath({
    target: elementOut.attr.position,
    point: columnController.middlePoint,
  });
  const rightLeg = getUnitsForPath({
    pathCoords: rightPath,
    color: elementOut.color,
    unitSize: Config.baseUnits[type].height,
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
  elementIn,
  columnController,
  fusionYPoint,
  angleRowController,
}: {
  elementIn: Fiber | Tube; // The fiber on the left side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  angleRowController: RowController; // In order to check where we can horizontally place our connection
  fusionYPoint: number;
}) => {
  const type = elementIn instanceof Tube ? "tube" : "fiber";

  const {
    path: leftPath,
    usedXPoint: leftUsedXPoint,
    usedYPoint: leftUsedYPoint,
  } = getLeftToPointPath({
    source: elementIn.attr.position,
    point: columnController.middlePoint,
    angleRowController,
    fusionYPoint,
    unitSize: Config.baseUnits[type].height,
  });

  if (leftUsedXPoint) {
    // We set now the used indexes in the angleRow
    angleRowController.indexController.setUsedIndexWithSize({
      point: leftUsedXPoint,
      size: Config.baseUnits[type].height,
      element: elementIn,
    });
  }

  if (leftUsedYPoint) {
    columnController.indexController.setUsedIndexWithSize({
      point: leftUsedYPoint,
      size: Config.baseUnits[type].height,
      element: elementIn,
    });
  }

  return getUnitsForPath({
    pathCoords: leftPath,
    color: elementIn.color,
    unitSize: Config.baseUnits[type].height,
  });
};

const getPendingLineToMiddle = ({
  element,
  fusionYPoint,
  middlePoint,
}: {
  element: Fiber;
  fusionYPoint: number;
  middlePoint: number;
}) => {
  let path = [];

  for (let iX = element.attr.position.x; iX >= middlePoint; iX -= 1) {
    path.push([iX, fusionYPoint]);
  }

  return getUnitsForPath({
    pathCoords: path,
    color: element.color,
    unitSize: Config.baseUnits.fiber.height,
  });
};
