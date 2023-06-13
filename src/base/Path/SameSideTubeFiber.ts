import { Config } from "@/base/Config";
import { Fiber } from "@/base/Fiber";
import { ColumnController } from "@/base/PathController/ColumnController/ColumnController";
import { RowController } from "@/base/PathController/RowController/RowController";
import { Tube } from "@/base/Tube";
import {
  getLeftToPointFlatPath,
  getLeftToPointPath,
  getRightToPointFlatPath,
  getRightToPointPath,
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
  const type = elementIn instanceof Tube ? "tube" : "fiber";

  // First we determine the fusion point searching for the vertical available space inside fusionColumn
  const fusionPoints = getFusionPoints({
    elementIn,
    elementOut,
    columnController,
  });

  // We set them as used in the fusion column
  fusionPoints.forEach((point) => {
    columnController.indexController.setUsedIndexWithSize({
      point,
      size: Config.baseUnits[type].height,
      element: elementIn,
    });
  });

  // We determine which one will be the upper and lower fibers
  const { firstFiber, secondFiber } = getOrderedFibers({
    elementIn,
    elementOut,
  });

  // There'll be three points in the middle column:
  // first for fiberIn
  // second center point where the circle will be placed
  // third for fiberOut

  const centerUpperMiddleDot = getUnitsForPath({
    unitSize: Config.baseUnits[type].height,
    color: firstFiber.color,
    pathCoords: [
      [
        columnController.middlePoint - Config.baseUnits[type].height / 2,
        fusionPoints[0],
      ],
      [
        columnController.middlePoint - Config.baseUnits[type].height / 2,
        fusionPoints[1],
      ],
    ],
  });

  const lowerDot = getUnitsForPath({
    unitSize: Config.baseUnits[type].height,
    color: secondFiber.color,
    pathCoords: [
      [
        columnController.middlePoint - Config.baseUnits[type].height / 2,
        fusionPoints[2],
      ],
    ],
  });

  const firstFiberPath = getLeg({
    element: firstFiber,
    fusionYPoint: fusionPoints[0],
    columnController,
    leftAngleRowController,
    rightAngleRowController,
  });

  const secondFiberPath = getLeg({
    element: secondFiber,
    fusionYPoint: fusionPoints[2],
    columnController,
    leftAngleRowController,
    rightAngleRowController,
  });

  return {
    fusionPoint: {
      x: columnController.middlePoint,
      y: fusionPoints[1],
    },
    path: [
      ...centerUpperMiddleDot,
      ...lowerDot,
      ...firstFiberPath,
      ...secondFiberPath,
    ],
  };
};

const getFusionPoints = ({
  elementIn,
  elementOut,
  columnController,
}: {
  elementIn: Fiber | Tube;
  elementOut: Fiber | Tube;
  columnController: ColumnController; // In order to check where we can vertically place our connection
}) => {
  const type = elementIn instanceof Tube ? "tube" : "fiber";

  const fusionInYPoints =
    columnController.indexController.getNFreeIndexesFromPoint({
      point: elementIn.attr.position.y,
      unitSize: Config.baseUnits[type].height,
      n: 3,
    });

  const [fusionInYpoint1, fusionInYpoint2, fusionInYpoint3] = fusionInYPoints;

  const fusionOutYPoints =
    columnController.indexController.getNFreeIndexesFromPoint({
      point: elementOut.attr.position.y,
      unitSize: Config.baseUnits[type].height,
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
  elementIn,
  elementOut,
}: {
  elementIn: Fiber | Tube;
  elementOut: Fiber | Tube;
}) => {
  const allFibers = [elementIn, elementOut];

  const sortedFibers = allFibers.sort((a: Fiber, b: Fiber) => {
    return a.attr.position.y - b.attr.position.y;
  });

  return {
    firstFiber: sortedFibers[0],
    secondFiber: sortedFibers[1],
  };
};

const getLeg = ({
  element,
  fusionYPoint,
  columnController,
  leftAngleRowController,
  rightAngleRowController,
}: {
  element: Fiber | Tube; // The fiber
  fusionYPoint: number; // Vertical index where the connection goes
  columnController: ColumnController; // In order to check where we can vertically place our connection
  leftAngleRowController: RowController; // In order to check where we can horizontally place our connection
  rightAngleRowController: RowController; // In order to check where we can horizontally place our connection
}) => {
  if (element.attr.position.y === fusionYPoint) {
    return getFlatLeg({ element, columnController });
  }

  const disposition =
    element instanceof Tube
      ? (element as Tube).parentWire.disposition
      : ((element as Fiber).parent as Tube).parentWire.disposition;

  // If not, we have to calculate the path
  if (disposition === "LEFT") {
    return getLeftLeg({
      element,
      fusionYPoint,
      columnController,
      angleRowController: leftAngleRowController,
    });
  } else {
    return getRightLeg({
      element,
      fusionYPoint,
      columnController,
      angleRowController: rightAngleRowController,
    });
  }
};

const getLeftLeg = ({
  element,
  fusionYPoint,
  columnController,
  angleRowController,
}: {
  element: Fiber | Tube; // The fiber
  fusionYPoint: number; // Vertical index where the connection goes
  columnController: ColumnController; // In order to check where we can vertically place our connection
  angleRowController: RowController; // In order to check where we can horizontally place our connection
}) => {
  const type = element instanceof Tube ? "tube" : "fiber";

  const {
    path: leftPath,
    usedXPoint: leftUsedXPoint,
    usedYPoint: leftUsedYPoint,
  } = getLeftToPointPath({
    source: element.attr.position,
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
      element: element,
    });
  }

  if (leftUsedYPoint) {
    columnController.indexController.setUsedIndexWithSize({
      point: leftUsedYPoint,
      size: Config.baseUnits[type].height,
      element: element,
    });
  }

  return getUnitsForPath({
    pathCoords: leftPath,
    color: element.color,
    unitSize: Config.baseUnits[type].height,
  });
};

const getRightLeg = ({
  element,
  fusionYPoint,
  columnController,
  angleRowController,
}: {
  element: Fiber | Tube; // The fiber
  fusionYPoint: number; // Vertical index where the connection goes
  columnController: ColumnController; // In order to check where we can vertically place our connection
  angleRowController: RowController; // In order to check where we can horizontally place our connection
}) => {
  const type = element instanceof Tube ? "tube" : "fiber";

  const {
    path: rightPath,
    usedXPoint: rightUsedXPoint,
    usedYPoint: rightUsedYPoint,
  } = getRightToPointPath({
    source: element.attr.position,
    point: columnController.middlePoint,
    angleRowController,
    fusionYPoint,
    unitSize: Config.baseUnits[type].height,
  });

  if (rightUsedXPoint) {
    // We set now the used indexes in the angleRow
    angleRowController.indexController.setUsedIndexWithSize({
      point: rightUsedXPoint,
      size: Config.baseUnits[type].height,
      element: element,
    });
  }

  if (rightUsedYPoint) {
    columnController.indexController.setUsedIndexWithSize({
      point: rightUsedYPoint,
      size: Config.baseUnits[type].height,
      element: element,
    });
  }

  return getUnitsForPath({
    pathCoords: rightPath,
    color: element.color,
    unitSize: Config.baseUnits[type].height,
  });
};

const getFlatLeg = ({
  element,
  columnController,
}: {
  element: Fiber | Tube; // The fiber
  columnController: ColumnController; // In order to check where we can vertically place our connection
}) => {
  const type = element instanceof Tube ? "tube" : "fiber";

  const disposition =
    element instanceof Tube
      ? (element as Tube).parentWire.disposition
      : ((element as Fiber).parent as Tube).parentWire.disposition;

  if (disposition === "LEFT") {
    const leftPath = getLeftToPointFlatPath({
      source: element.attr.position,
      point: columnController.middlePoint,
    });
    return getUnitsForPath({
      pathCoords: leftPath,
      color: element.color,
      unitSize: Config.baseUnits[type].height,
    });
  } else {
    const rightPath = getRightToPointFlatPath({
      target: element.attr.position,
      point: columnController.middlePoint,
    });

    return getUnitsForPath({
      pathCoords: rightPath,
      color: element.color,
      unitSize: Config.baseUnits[type].height,
    });
  }
};
