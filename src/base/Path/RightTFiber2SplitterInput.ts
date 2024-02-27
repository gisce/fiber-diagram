import { Config } from "@/base/Config";
import { Fiber } from "@/base/Fiber";
import { ColumnController } from "@/base/PathController/ColumnController/ColumnController";
import { RowController } from "@/base/PathController/RowController/RowController";
import { Tube } from "@/base/Tube";
import { getLeftToPointPath, getUnitsForPath } from "@/utils/pathUtils";
import { getRightLeg } from "./LeftTFiber2RightTFiber";

export default ({
  elementIn,
  elementOut,
  columnController,
  leftAngleRowController,
  rightAngleRowController,
}: {
  elementIn: Fiber; // The fiber on the RIGHT side
  elementOut: Fiber; // The splitter fiber input
  columnController: ColumnController; // In order to check where we can vertically place our connection
  leftAngleRowController: RowController; // In order to check where we can horizontally place our connection
  rightAngleRowController: RowController; // In order to check where we can horizontally place our connection
}) => {
  const source = elementIn.attr.position;
  const type = elementIn instanceof Tube ? "tube" : "fiber";

  // First we determine the fusion point searching for the vertical available space inside fusionColumn
  const fusionYPoint =
    columnController.indexController.getNFreeIndexesFromPoint({
      point: source.y,
      unitSize: Config.baseUnits[type].height,
      n: 1,
    })[0];

  // And we set now this point as used index in the fusion column
  columnController.indexController.setUsedIndexWithSize({
    point: fusionYPoint,
    size: Config.baseUnits[type].height,
    element: elementIn,
  });

  const leftLeg = getLeftLeg({
    elementOut,
    columnController,
    angleRowController: leftAngleRowController,
    fusionYPoint,
    color: elementIn.color,
  });

  const pendingToMiddleLeg: any[] = [];

  const rightLeg = getRightLeg({
    elementOut: elementIn,
    columnController,
    angleRowController: rightAngleRowController,
    fusionYPoint,
  });

  return {
    fusionPoint: {
      x: elementOut.attr.position.x,
      y: elementOut.attr.position.y,
    },
    path: [...leftLeg, ...pendingToMiddleLeg, ...rightLeg],
  };
};

const getLeftLeg = ({
  elementOut,
  columnController,
  fusionYPoint,
  angleRowController,
  color,
}: {
  elementOut: Fiber | Tube; // The fiber on the left side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  angleRowController: RowController; // In order to check where we can horizontally place our connection
  fusionYPoint: number;
  color: string;
}) => {
  const type = elementOut instanceof Tube ? "tube" : "fiber";

  const {
    path: leftPath,
    usedXPoint: leftUsedXPoint,
    usedYPoint: leftUsedYPoint,
  } = getLeftToPointPath({
    source: elementOut.attr.position,
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
      element: elementOut,
    });
  }

  if (leftUsedYPoint) {
    columnController.indexController.setUsedIndexWithSize({
      point: leftUsedYPoint,
      size: Config.baseUnits[type].height,
      element: elementOut,
    });
  }

  // From elementOut x to leftUsedXPoint
  for (let iX = elementOut.attr.position.x - 1; iX >= leftUsedXPoint; iX -= 1) {
    leftPath.push([iX, elementOut.attr.position.y]);
  }

  return getUnitsForPath({
    pathCoords: leftPath,
    color,
    unitSize: Config.baseUnits[type].height,
  });
};
