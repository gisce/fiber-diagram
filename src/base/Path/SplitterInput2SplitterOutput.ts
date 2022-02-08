import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { ColumnController } from "base/PathController/ColumnController/ColumnController";
import { RowController } from "base/PathController/RowController/RowController";
import { Splitter } from "base/Splitter";
import { Tube } from "base/Tube";
import { getRightToPointPath, getUnitsForPath } from "utils/pathUtils";

export default ({
  elementIn,
  elementOut,
  columnController,
  leftAngleRowController,
  rightAngleRowController,
}: {
  elementIn: Fiber | Tube; // The splitter fiber output
  elementOut: Fiber | Tube; // The splitter fiber input
  columnController: ColumnController; // In order to check where we can vertically place our connection
  leftAngleRowController: RowController; // In order to check where we can horizontally place our connection
  rightAngleRowController: RowController; // In order to check where we can horizontally place our connection
}) => {
  const source = elementIn.attr.position;

  const type = elementIn instanceof Tube ? "tube" : "fiber";

  const fusionYPoint = source.y;

  // And we set now this point as used index in the fusion column
  columnController.indexController.setUsedIndexWithSize({
    point: fusionYPoint,
    size: Config.baseUnits[type].height,
    element: elementIn,
  });

  // If the fibers are not flat, we get our left and right paths separately
  const rightLeg = getRightLeg({
    elementOut,
    elementIn,
    columnController,
    angleRowController: rightAngleRowController,
    fusionYPoint,
  });

  return {
    fusionPoint: {
      x: source.x + Config.baseUnits[type].width,
      y: fusionYPoint,
    },
    path: [...rightLeg],
  };
};

const getRightLeg = ({
  elementIn,
  elementOut,
  columnController,
  fusionYPoint,
  angleRowController,
}: {
  elementIn: Fiber | Tube; // The fiber on the right side
  elementOut: Fiber | Tube; // The fiber on the right side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  angleRowController: RowController; // In order to check where we can horizontally place our connection
  fusionYPoint: number;
}) => {
  const type = elementOut instanceof Tube ? "tube" : "fiber";

  const sourceSplitter = (elementIn as Fiber).parent as Splitter;

  const {
    path: rightPath,
    usedXPoint: rightUsedXPoint,
    usedYPoint: rightUsedYPoint,
  } = getRightToPointPath({
    source: elementOut.attr.position,
    point: elementIn.attr.position.x + 1,
    angleRowController,
    fusionYPoint,
    unitSize: Config.baseUnits[type].height,
    minAngle: sourceSplitter.attr.position.x + sourceSplitter.attr.size.width,
  });

  if (rightUsedXPoint) {
    // We set now the used indexes in the angleRow
    angleRowController.indexController.setUsedIndexWithSize({
      point: rightUsedXPoint,
      size: Config.baseUnits[type].height,
      element: elementOut,
    });
  }

  if (rightUsedYPoint) {
    columnController.indexController.setUsedIndexWithSize({
      point: rightUsedYPoint,
      size: Config.baseUnits[type].height,
      element: elementOut,
    });
  }

  return getUnitsForPath({
    pathCoords: rightPath,
    color: elementOut.color,
    unitSize: Config.baseUnits[type].height,
  });
};
