import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { Grid, LegType, Position, VerticalIndexElement } from "base/Grid";

export type Columns = { [key: number]: VerticalIndexElement };

export const getNPointsBelowYpoint = ({
  fromY,
  unitSize,
  n,
}: {
  fromY: number;
  unitSize: number;
  n: number;
}) => {
  const indexes = [];

  for (let i = 0; i < n; i++) {
    indexes.push(fromY + i * unitSize);
  }

  return indexes.sort(function (a, b) {
    return a - b;
  });
};

export const getNPointsAboveYpoint = ({
  fromY,
  unitSize,
  n,
}: {
  fromY: number;
  unitSize: number;
  n: number;
}) => {
  const indexes = [];

  for (let i = 0; i < n; i++) {
    indexes.push(fromY - i * unitSize);
  }

  return indexes.sort(function (a, b) {
    return a - b;
  });
};

export const checkIfIndexIsFree = ({
  index,
  columns,
  gridHeight,
}: {
  index: number;
  columns: Columns;
  gridHeight: number;
}) => {
  return columns[index] === undefined && index < gridHeight;
};

export const getNFreeIndexesFromYpoint = ({
  columns,
  unitSize,
  n,
  fromY,
  gridHeight,
}: {
  n: number; // Number of indexes to find
  unitSize: number; // Size of the unit
  fromY: number; // Y point to start from
  columns: Columns; // Columns to check
  gridHeight: number; // Max height of the grid
}) => {
  let freeAboveIndexes: number[];
  let freeBelowIndexes: number[];

  // First, we check if for free units *BELOW* the y point, and store them in freeAboveIndexes
  for (let i = fromY; i < gridHeight; i++) {
    const indexes = getNPointsBelowYpoint({
      fromY: i,
      unitSize,
      n,
    });

    const first = indexes[0];
    const last = indexes[indexes.length - 1];

    const indexesWithSeparation = [
      ...indexes,
      first - unitSize,
      last + unitSize,
    ];

    const indexesAreFree = indexesWithSeparation.every((index) => {
      return checkIfIndexIsFree({
        index,
        columns,
        gridHeight,
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
      unitSize,
      n,
    });

    const first = indexes[0];
    const last = indexes[indexes.length - 1];

    const indexesWithSeparation = [...indexes];

    for (let i = first; i >= first - unitSize; i -= 1) {
      indexesWithSeparation.push(i);
    }

    for (let i = last; i <= last + unitSize; i += 1) {
      indexesWithSeparation.push(i);
    }

    const indexesAreFree = indexesWithSeparation.every((index) => {
      return checkIfIndexIsFree({
        index,
        columns,
        gridHeight,
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
      modifiedHeight: gridHeight + unitSize + n * unitSize,
      freeIndexes: getNPointsAboveYpoint({
        fromY: gridHeight + unitSize,
        unitSize,
        n,
      }),
    };
  }

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

export const getUnitsForPath = ({
  path,
  color,
  unitSize,
}: {
  path: number[][];
  unitSize: number;
  color: string;
}): LegType[] => {
  return path.map((entry) => {
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

export const getPathForConnection = ({
  disposition,
  element_id,
  source,
  type,
  target,
  grid,
}: {
  disposition: "LEFT" | "RIGHT";
  source: Position;
  target: Position;
  element_id: number;
  type: "tube" | "fiber";
  grid: Grid;
}) => {
  const unitSize = Config.baseUnits[type].height;

  const isLeftToRightConnection = disposition === "LEFT";
  const ourSideUsedSpace = isLeftToRightConnection
    ? grid.leftUsedSpace
    : grid.rightUsedSpace;

  const spaceForThisPath = unitSize * Config.angleSeparatorFactor;
  const separation = spaceForThisPath + ourSideUsedSpace;

  let angleXpoint: number;
  let path = [];

  if (source.y === target.y) {
    if (isLeftToRightConnection) {
      for (let iX = source.x; iX < target.x; iX += 1) {
        path.push([iX, source.y]);
      }
    } else {
      for (let iX = source.x; iX >= target.x; iX -= 1) {
        path.push([iX, source.y]);
      }
    }

    grid.setVerticalUsedIndexWithHeight({
      yPoint: source.y,
      height: unitSize,
      element: {
        type: type,
        id: element_id,
      },
    });

    return path;
  }

  if (isLeftToRightConnection) {
    angleXpoint = target.x - (separation + unitSize);
    grid.leftUsedSpace += spaceForThisPath;
  } else {
    angleXpoint = target.x + separation;
    grid.rightUsedSpace += spaceForThisPath;
  }

  path = [[angleXpoint, source.y]];

  // from: source.x, source.y
  // to: angleXpoint, source.y
  if (isLeftToRightConnection) {
    for (let iX = source.x; iX < angleXpoint; iX += 1) {
      path.push([iX, source.y]);
    }
  } else {
    for (let iX = source.x; iX >= angleXpoint; iX -= 1) {
      path.push([iX, source.y]);
    }
  }

  // from: angleXpoint, source.y
  // to: angleXpoint, target.y
  if (source.y < target.y) {
    for (let iY = source.y; iY < target.y; iY += 1) {
      path.push([angleXpoint, iY]);
    }
  } else {
    for (let iY = source.y; iY > target.y; iY -= 1) {
      path.push([angleXpoint, iY]);
    }
  }

  // from: angleXpoint, toY
  // to: target.x, toY
  if (isLeftToRightConnection) {
    for (let iX = angleXpoint; iX < target.x; iX += 1) {
      path.push([iX, target.y]);
    }
  } else {
    for (let iX = angleXpoint; iX >= target.x; iX -= 1) {
      path.push([iX, target.y]);
    }
  }

  grid.setVerticalUsedIndexWithHeight({
    yPoint: source.y,
    height: unitSize,
    element: {
      type: type,
      id: element_id,
    },
  });

  grid.setVerticalUsedIndexWithHeight({
    yPoint: target.y,
    height: unitSize,
    element: {
      type: type,
      id: element_id,
    },
  });

  return path;
};

export const getSplitterToSplitterPath = ({
  element_id,
  source,
  type,
  target,
  grid,
}: {
  source: Position;
  target: Position;
  element_id: number;
  type: "tube" | "fiber";
  grid: Grid;
}) => {
  const unitSize = Config.baseUnits[type].height;

  const spaceForThisPath = unitSize * Config.angleSeparatorFactor;

  let angleXpoint: number;
  let path = [];

  angleXpoint = target.x;
  grid.leftUsedSpace += spaceForThisPath;

  // from: source.x, source.y
  // to: angleXpoint, source.y
  for (let iX = source.x; iX <= angleXpoint; iX += 1) {
    path.push([iX, source.y]);
  }

  // from: angleXpoint, source.y;
  // to: angleXpoint, target.y;
  if (target.y < source.y) {
    for (let iY = source.y; iY >= target.y; iY -= 1) {
      path.push([angleXpoint, iY]);
    }
  } else {
    for (let iY = source.y; iY <= target.y; iY += 1) {
      path.push([angleXpoint, iY]);
    }
  }

  grid.setVerticalUsedIndexWithHeight({
    yPoint: source.y,
    height: unitSize,
    element: {
      type: type,
      id: element_id,
    },
  });

  grid.setVerticalUsedIndexWithHeight({
    yPoint: target.y,
    height: unitSize,
    element: {
      type: type,
      id: element_id,
    },
  });

  return path;
};

export const getClearedVerticalIndexesForElement = ({
  element,
  verticalUsedIndexes,
}: {
  element: VerticalIndexElement;
  verticalUsedIndexes: Columns;
}) => {
  const output: Columns = {};

  Object.keys(verticalUsedIndexes).forEach((key) => {
    const entry = verticalUsedIndexes[key];

    if (entry.type !== element.type || entry.id !== element.id) {
      output[key] = entry;
    }
  });
  return output;
};

export const getPathForSplitterOutputToRightFiber = ({
  tubeFiber,
  splitterFiber,
  grid,
}: {
  tubeFiber: Fiber;
  splitterFiber: Fiber;
  grid: Grid;
}) => {
  const unitSize = Config.baseUnits.fiber.height;
  const spaceForThisPath = unitSize * Config.angleSeparatorFactor;
  const separation = spaceForThisPath + grid.rightUsedSpace;

  let angleXpoint: number = 0;
  let path = [];

  // Check if our splitterFiber is below an another fiber, and if so, we consider the other splitter X
  const sibilingSplitters = splitterFiber.parentSplitter.getSplitterSibilings();

  if (sibilingSplitters && sibilingSplitters.length >= 1) {
    const sortedSplitters = sibilingSplitters.sort((a, b) => {
      return b.attr.position.x - a.attr.position.x;
    });
    const rightestSplitter = sortedSplitters[0];

    if (rightestSplitter.attr.position.x > splitterFiber.attr.position.x) {
      const rightestSplitterX =
        rightestSplitter.attr.position.x + rightestSplitter.attr.size.width;

      angleXpoint = rightestSplitterX + separation;
    } else {
      angleXpoint =
        splitterFiber.attr.position.x +
        Config.baseUnits.fiber.width +
        separation;
    }
  } else {
    angleXpoint =
      splitterFiber.attr.position.x + Config.baseUnits.fiber.width + separation;
  }

  grid.rightUsedSpace += spaceForThisPath;

  path = [[angleXpoint, splitterFiber.attr.position.y]];

  // from: source.x, source.y
  // to: angleXpoint, source.y
  for (
    let iX = splitterFiber.attr.position.x + Config.baseUnits.fiber.width;
    iX <= angleXpoint;
    iX += 1
  ) {
    path.push([iX, splitterFiber.attr.position.y]);
  }

  // from: angleXpoint, source.y
  // to: angleXpoint, target.y
  if (tubeFiber.attr.position.y < splitterFiber.attr.position.y) {
    for (
      let iY = splitterFiber.attr.position.y;
      iY >= tubeFiber.attr.position.y;
      iY -= 1
    ) {
      path.push([angleXpoint, iY]);
    }
  } else {
    for (
      let iY = splitterFiber.attr.position.y;
      iY <= tubeFiber.attr.position.y;
      iY += 1
    ) {
      path.push([angleXpoint, iY]);
    }
  }

  // from: angleXpoint, toY
  // to: target.x, toY
  for (let iX = angleXpoint; iX <= tubeFiber.attr.position.x; iX += 1) {
    path.push([iX, tubeFiber.attr.position.y]);
  }

  grid.setVerticalUsedIndexWithHeight({
    yPoint: splitterFiber.attr.position.y,
    height: unitSize,
    element: {
      type: "fiber",
      id: splitterFiber.id,
    },
  });

  grid.setVerticalUsedIndexWithHeight({
    yPoint: tubeFiber.attr.position.y,
    height: unitSize,
    element: {
      type: "fiber",
      id: splitterFiber.id,
    },
  });

  return path;
};
