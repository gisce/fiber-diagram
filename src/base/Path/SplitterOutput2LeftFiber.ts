import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { ColumnController } from "base/PathController/ColumnController/ColumnController";
import { RowController } from "base/PathController/RowController/RowController";
import { getUnitsForPath } from "utils/pathUtils";
import { getLeftLeg } from "./LeftTFiber2RightTFiber";

export default ({
  elementIn,
  elementOut,
  columnController,
  leftAngleRowController,
  rightAngleRowController,
}: {
  elementIn: Fiber; // The splitter output on the right
  elementOut: Fiber; // Tube tube fibber on the left
  columnController: ColumnController;
  leftAngleRowController: RowController;
  rightAngleRowController: RowController;
}) => {
  const source = elementIn.attr.position;

  const type = "fiber";

  // First we determine the fusion point searching for the vertical available space inside fusionColumn
  // These points have to be placed below all splitters, so we use the biggest possible point

  // We find for the lowest placed splitter
  const sortedSplitters = elementIn.parent
    .getParentGrid()
    .splitters.sort((a, b) => {
      return b.attr.position.y - a.attr.position.y;
    });
  const lowestPlacedSplitter = sortedSplitters[0];

  const lowestSplitterUsedPosition =
    lowestPlacedSplitter.attr.position.y +
    lowestPlacedSplitter.attr.size.height;

  const fusionYPoint = columnController.indexController.getFreeAboveIndexes({
    point: lowestSplitterUsedPosition + Config.baseUnits.fiber.height * 2,
    unitSize: Config.baseUnits[type].height,
    n: 1,
  })[0];

  // And we set now this point as used index in the fusion column
  columnController.indexController.setUsedIndexWithSize({
    point: fusionYPoint,
    size: Config.baseUnits[type].height,
    element: elementIn,
  });

  const biggestXforSplitters = (elementIn as Fiber).parent
    .getParentGrid()
    .getSplittersMaxHposition();

  // We determine the angle point searching horizontal available space inside angleRow
  const freeXPoint =
    rightAngleRowController.indexController.getFreeAboveIndexes({
      point: biggestXforSplitters + Config.baseUnits.fiber.height * 2,
      unitSize: Config.baseUnits.fiber.height,
      n: 1,
    })[0];

  // And we set now this point as used index in the right angle row
  rightAngleRowController.indexController.setUsedIndexWithSize({
    point: freeXPoint,
    size: Config.baseUnits[type].height,
    element: elementIn,
  });

  // First we get the leg from splitter output to the X angle calculated for this right side
  const rightSideLeg = getRightSideLeg({
    elementIn,
    freeXPoint,
    fusionYPoint,
    middlePoint: columnController.middlePoint,
    color: elementOut.color,
  });

  const leftSideLeg = getLeftLeg({
    elementIn: elementOut,
    columnController,
    angleRowController: leftAngleRowController,
    fusionYPoint,
  });

  return {
    fusionPoint: {
      x: columnController.middlePoint,
      y: fusionYPoint,
    },
    path: [...rightSideLeg, ...leftSideLeg],
  };
};

const getRightSideLeg = ({
  elementIn,
  freeXPoint,
  fusionYPoint,
  middlePoint,
  color,
}: {
  elementIn: Fiber; // The splitter output on the right
  freeXPoint: number;
  fusionYPoint: number;
  middlePoint: number;
  color: string;
}) => {
  let path = [];

  for (
    let iX = elementIn.attr.position.x + Config.baseUnits.fiber.width;
    iX < freeXPoint;
    iX += 1
  ) {
    path.push([iX, elementIn.attr.position.y]);
  }

  for (let iY = elementIn.attr.position.y; iY < fusionYPoint; iY += 1) {
    path.push([freeXPoint, iY]);
  }

  for (let iX = freeXPoint; iX >= middlePoint; iX -= 1) {
    path.push([iX, fusionYPoint]);
  }

  return getUnitsForPath({
    pathCoords: path,
    color: color,
    unitSize: Config.baseUnits.fiber.height,
  });
};
